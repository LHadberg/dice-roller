import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Button,
    Text,
    Group,
    ActionIcon,
    Center,
    Loader,
    Drawer,
    Transition,
    SimpleGrid,
} from '@mantine/core';
import DiceBox from '@3d-dice/dice-box';
import { Action, DiceResult } from '../types/types';
import {
    IconChevronLeft,
    IconChevronRight,
    IconSettings,
} from '@tabler/icons-react';
import styles from '../styles/DiceBox.module.css';
import { LocalStorageConfigurationReturn } from '../hooks/useLocalStorageConfiguration';

declare global {
    interface Window {
        __DICEBOX_AMMO_INIT__?: boolean;
    }
}
if (typeof window !== "undefined" && !window.__DICEBOX_AMMO_INIT__) {
    window.__DICEBOX_AMMO_INIT__ = false;
}


export interface DiceBoxProps {
    configuration: LocalStorageConfigurationReturn;
    toggleShowDiceBox: () => void;
}

const DiceBoxComponent: React.FC<DiceBoxProps> = ({
    configuration,
    toggleShowDiceBox,
}) => {
    const { actions, physicsConfig, visualConfig } = configuration;

    // UI state
    const [results, setResults] = useState<DiceResult[]>([]);
    const [showActions, setShowActions] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [displayTotal, setDisplayTotal] = useState(0);
    const [isDamageRoll, setIsDamageRollState] = useState(false);

    // Refs for state and resources
    const isDamageRollRef = useRef<boolean>(isDamageRoll);
    const diceBoxRef = useRef<InstanceType<typeof DiceBox> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<ResizeObserver | null>(null);
    const updatingRef = useRef<boolean>(false);

    // Keep config in refs so initialization doesn't re-run if props change
    const physicsRef = useRef(configuration.physicsConfig);
    const visualRef = useRef(configuration.visualConfig);
    physicsRef.current = physicsConfig;
    visualRef.current = visualConfig;

    const setIsDamageRoll = (v: boolean) => {
        isDamageRollRef.current = v;
        setIsDamageRollState(v);
    };

    const containerId = useRef('dice-container-' + Math.random().toString(36).slice(2));

    const updateCanvasSize = useCallback(() => {
        if (updatingRef.current) return;
        updatingRef.current = true;

        const container = document.getElementById(containerId.current);
        if (!container) {
            updatingRef.current = false;
            return;
        }

        const canvas = container.querySelector('canvas') as HTMLCanvasElement | null;
        if (!canvas) {
            updatingRef.current = false;
            return;
        }

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));
            updatingRef.current = false;
        });
    }, []);

    // initializeDiceBox: runs once when container mounts. Captures configs from refs.
    const initializeDiceBox = useCallback(async () => {
        if (!containerRef.current) return;

        if (window.__DICEBOX_AMMO_INIT__ && diceBoxRef.current) {
            return;
        }

        if (diceBoxRef.current) return;

        try {
            const box = new DiceBox({
                container: `#${containerId.current}`,
                assetPath: '/assets/dice-box/',
                theme: visualRef.current.theme,
                themeColor: visualRef.current.themeColor,
                scale: 6,
                gravity: physicsRef.current.gravity,
                mass: physicsRef.current.mass,
                friction: physicsRef.current.friction,
                restitution: physicsRef.current.restitution,
                linearDamping: physicsRef.current.linearDamping,
                angularDamping: physicsRef.current.angularDamping,
                offscreen: true,
            });

            diceBoxRef.current = box;

            await box.init();

            window.__DICEBOX_AMMO_INIT__ = true;

            updateCanvasSize();
            setIsLoading(false);

            box.onRollComplete = (rollResults: any[]) => {
                setIsRandomizing(false);
                const total = rollResults.reduce((acc: number, r: { value: number }) => acc + r.value, 0);
                setDisplayTotal(total);
                if (!isDamageRollRef.current) setResults(rollResults);
            };

            if (containerRef.current) {
                observerRef.current = new ResizeObserver(updateCanvasSize);
                observerRef.current.observe(containerRef.current);
            }
            window.addEventListener('resize', updateCanvasSize);
        } catch (err) {
            console.error('Failed to initialize dice box:', err);
            setIsLoading(false);
        }
    }, [updateCanvasSize]);


    // Ref-callback attached to the rendered div. Called exactly when DOM node mounts/unmounts.
    const containerCallbackRef = useCallback(
        (node: HTMLDivElement | null) => {
            containerRef.current = node;

            if (node && !diceBoxRef.current) {
                // DOM node now exists — initialize dice box
                initializeDiceBox();
            }
        },
        [initializeDiceBox]
    );

    // Single cleanup effect for unmount: clears dicebox, removes observers and listeners.
    useEffect(() => {
        return () => {
            // Clear DiceBox instance
            if (diceBoxRef.current) {
                try {
                    diceBoxRef.current.clear();
                } catch (e) {
                    console.error('Error clearing dice box on unmount:', e);
                }
                diceBoxRef.current = null;
            }

            // Disconnect ResizeObserver
            if (observerRef.current) {
                try {
                    observerRef.current.disconnect();
                } catch (e) {
                    // ignore
                }
                observerRef.current = null;
            }

            // Remove window resize listener
            try {
                window.removeEventListener('resize', updateCanvasSize);
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // ---------------------------
    //  ROLL FUNCTIONS
    // ---------------------------

    const rollD20 = useCallback(async () => {
        if (!diceBoxRef.current) return;

        setResults([]);
        setIsRandomizing(true);
        setIsDamageRoll(false);

        try {
            const r = await diceBoxRef.current.roll(['1d20']);
            if (r && r[0]) {
                setResults([{ qty: 1, value: r[0].value, rolls: [{ dieType: 'd20' }] }]);
                setDisplayTotal(r[0].value);
            }
        } catch (e) {
            console.error('Error during d20 roll:', e);
            setIsRandomizing(false);
        }
    }, []);

    const reroll = useCallback(async () => {
        if (!diceBoxRef.current || results.length === 0) return;

        const notations = results.map((r) => `${r.qty}${r.rolls[0].dieType}`);
        setResults([]);
        setIsRandomizing(true);

        try {
            await diceBoxRef.current.roll(notations);
        } catch (e) {
            console.error('Error during reroll:', e);
            setIsRandomizing(false);
        }
    }, [results]);

    // ---------------------------
    //  RENDER
    // ---------------------------

    return (
        <div id="dicebox-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }} onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className={`${styles.diffusedBackground} ${styles.header}`}>
                <Group justify="space-between" align="center">
                    <Button
                        variant="subtle"
                        disabled={results.length === 0}
                        onClick={() => setShowResults((v) => !v)}
                        className={styles.totalButton}
                    >
                        <Text size="xl" fw={700} className={styles.totalText}>
                            {`Total ${isRandomizing ? displayTotal : results.reduce((a, r) => a + r.value, 0)}`}
                        </Text>
                    </Button>

                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        onClick={() => setShowActions((v) => !v)}
                    >
                        {showActions ? <IconChevronRight size={24} /> : <IconChevronLeft size={24} />}
                    </ActionIcon>
                </Group>

                {/* RESULTS PANEL */}
                <Transition
                    mounted={showResults}
                    transition={{
                        transitionProperty: 'opacity, transform',
                        in: { opacity: 1, transform: 'translateY(0)' },
                        out: { opacity: 0, transform: 'translateY(-20px)' },
                        common: { transition: 'opacity 400ms ease, transform 400ms ease' },
                    }}
                >
                    {(style) => (
                        <div className={styles.resultsContainer} style={style}>
                            <SimpleGrid cols={4} spacing="md">
                                {results.map((r, index) => (
                                    <div key={index} className={styles.resultCard}>
                                        <Text fw={500}>{r.qty + r.rolls[0].dieType}</Text>
                                        <Text size="xl" fw={700}>
                                            {r.value}
                                        </Text>
                                    </div>
                                ))}
                            </SimpleGrid>
                        </div>
                    )}
                </Transition>
            </div>

            {/* MAIN 3D DICE AREA */}
            <div className={styles.mainContainer} style={{ backgroundColor: 'transparent' }}>
                <div
                    id={containerId.current}
                    ref={containerCallbackRef}
                    className={styles.diceContainer}
                // ensure the container has non-zero size via CSS; dice-box requires visible area
                />

                {isLoading && (
                    <Center className={styles.loader}>
                        <Loader size="xl" />
                    </Center>
                )}
            </div>

            {/* ACTIONS DRAWER */}
            <Drawer
                opened={showActions}
                onClose={() => setShowActions(false)}
                position="right"
                size="md"
                title="Actions"
                withinPortal={false}
            >
                <div className={styles.actionWrapper}>
                    {actions.map((action: Action) => (
                        <Button key={action.id} fullWidth>
                            {action.name}
                        </Button>
                    ))}
                </div>
            </Drawer>

            {/* FOOTER */}
            <div className={`${styles.diffusedBackground} ${styles.footer}`}>
                <Group justify="space-between" align="center">
                    {/* TODO Parametize labels for localization */}
                    <ActionIcon variant="light" size={48} onClick={rollD20} color="blue">
                        d20
                    </ActionIcon>

                    <Button
                        size="lg"
                        onClick={reroll}
                        disabled={results.length === 0}
                        className={styles.rerollButton}
                    >
                        Reroll
                    </Button>

                    <ActionIcon variant="light" size={48} onClick={toggleShowDiceBox}>
                        <IconSettings size={36} />
                    </ActionIcon>
                </Group>
            </div>
        </div>
    );
};

export default DiceBoxComponent;
