import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, Group, ActionIcon, Center, Loader, Menu, Drawer, Transition, SimpleGrid, Alert, Stack, MantineProvider } from '@mantine/core';
import DiceBox from '@3d-dice/dice-box';
import { Action, RollType, DiceResult, D20Result, DiceRollResult } from '../types/types';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconSettings, IconCheck, IconX } from '@tabler/icons-react';
import styles from '../styles/DiceBox.module.css';
import { LocalStorageConfigurationReturn } from '../hooks/useLocalStorageConfiguration';

export interface DiceBoxProps {
	configuration: LocalStorageConfigurationReturn;
	toggleShowDiceBox: (value?: React.SetStateAction<boolean> | undefined) => void;
}

const DiceBoxComponent: React.FC<DiceBoxProps> = ({ configuration, toggleShowDiceBox }) => {
	console.log('DiceBox Rendering');
	const { stats, actions, physicsConfig, visualConfig } = configuration;
	const [results, setResults] = useState<DiceResult[]>([]);
	const [showResults, setShowResults] = useState<boolean>(false);
	const [showActions, setShowActions] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(true);
	const [displayTotal, setDisplayTotal] = useState<number>(0);
	const [isRandomizing, setIsRandomizing] = useState<boolean>(false);
	const [lastActionName, setLastActionName] = useState<string>('');
	const [pendingAction, setPendingAction] = useState<Action | null>(null);
	const [d20Result, setD20Result] = useState<D20Result | null>(null);
	const [lastRolledAction, setLastRolledAction] = useState<Action | null>(null);
	const [isDamageRoll, setIsDamageRoll] = useState(false);

	const intervalRef = useRef<number>();
	const diceBoxRef = useRef<InstanceType<typeof DiceBox> | null>(null);
	const containerId = useRef(`dice-container-${Math.random().toString(36).substr(2, 9)}`);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const currentRef = intervalRef.current;
		return () => {
			if (currentRef) {
				window.clearInterval(currentRef);
			}
		};
	}, []);

	const updateCanvasSize = () => {
		if ((updateCanvasSize as any).isUpdating) return;
		(updateCanvasSize as any).isUpdating = true;

		const container = document.getElementById(containerId.current);
		if (container) {
			const canvas = container.querySelector('canvas');
			if (canvas) {
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				requestAnimationFrame(() => {
					window.dispatchEvent(new Event('resize'));
					(updateCanvasSize as any).isUpdating = false;
				});
			} else {
				(updateCanvasSize as any).isUpdating = false;
			}
		} else {
			(updateCanvasSize as any).isUpdating = false;
		}
	};

	useEffect(() => {
		const initializeDiceBox = async () => {
			document.querySelectorAll('[id^="dice-container-"]').forEach((element) => {
				if (element.id !== containerId.current) {
					element.remove();
				}
			});

			await new Promise((resolve) => setTimeout(resolve, 1000));

			const container = document.getElementById(containerId.current);

			if (!container) {
				console.error('Dice container not found', containerId.current);
				return;
			}

			if (!diceBoxRef.current) {
				try {
					const box = new DiceBox({
						container: `#${containerId.current}`,
						assetPath: '/assets/dice-box/',
						theme: visualConfig.theme,
						scale: 6,
						offscreen: true,
						gravity: physicsConfig.gravity,
						mass: physicsConfig.mass,
						friction: physicsConfig.friction,
						restitution: physicsConfig.restitution,
						linearDamping: physicsConfig.linearDamping,
						angularDamping: physicsConfig.angularDamping,
						themeColor: visualConfig.themeColor,
					});

					diceBoxRef.current = box;

					await box.init();
					console.log('Dice box initialized');
					updateCanvasSize();
					setIsLoading(false);

					box.onRollComplete = (rollResults) => {
						console.log('Roll results:', rollResults);
						setIsRandomizing(false);
						if (intervalRef.current) {
							window.clearInterval(intervalRef.current);
						}
						const total = rollResults.reduce((acc: any, r: any) => acc + r.value, 0);
						setDisplayTotal(total);

						// Only save results if it's not a damage roll from an action that required a hit
						if (!isDamageRoll || (lastRolledAction && !lastRolledAction.requiresD20)) {
							setResults(rollResults);
						}
					};
				} catch (error) {
					console.error('Failed to initialize dice box:', error);
					setIsLoading(false);
				}
			}
		};

		const resizeObserver = new ResizeObserver(updateCanvasSize);
		const container = document.getElementById(containerId.current);
		if (container) {
			resizeObserver.observe(container);
		}

		window.addEventListener('resize', updateCanvasSize);

		initializeDiceBox();

		return () => {
			if (diceBoxRef.current) {
				try {
					diceBoxRef.current.clear();
					diceBoxRef.current = null;
				} catch (error) {
					console.error('Error during cleanup:', error);
				}
			}
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateCanvasSize);
		};
	}, []);

	useEffect(() => {
		if (diceBoxRef.current) {
			diceBoxRef.current.updateConfig({
				theme: visualConfig.theme,
				themeColor: visualConfig.themeColor,
				gravity: physicsConfig.gravity,
				mass: physicsConfig.mass,
				friction: physicsConfig.friction,
				restitution: physicsConfig.restitution,
				linearDamping: physicsConfig.linearDamping,
				angularDamping: physicsConfig.angularDamping,
			});
		}
	}, [physicsConfig, visualConfig]);

	const performActionRoll = async (action: Action, rollType: RollType = 'normal') => {
		setShowActions(false);
		const diceBox = diceBoxRef.current;
		if (!diceBox) return;

		setLastActionName(action.name);
		setLastRolledAction(action);

		if (action.requiresD20) {
			setIsDamageRoll(false);
			const modifier = action.statModifier ? stats[action.statModifier].modifier : 0;
			const rollNotation = rollType === 'normal' ? '1d20' : '2d20';

			setResults([]);
			setIsRandomizing(true);

			try {
				const attackResults = (await diceBox.roll([rollNotation])) as DiceRollResult[];
				if (!Array.isArray(attackResults)) {
					console.error('Invalid roll results structure:', attackResults);
					return;
				}

				const rollValues = attackResults.map((r) => r.value);
				let attackRoll: number;

				if (rollType === 'advantage') {
					attackRoll = Math.max(...rollValues);
				} else if (rollType === 'disadvantage') {
					attackRoll = Math.min(...rollValues);
				} else {
					attackRoll = rollValues[0];
				}

				const totalAttack = attackRoll + modifier;
				setDisplayTotal(totalAttack);
				setD20Result({
					rolls: rollValues,
					finalValue: totalAttack,
					modifier,
					rollType,
				});
				setPendingAction(action);

				setResults([
					{
						qty: 1,
						value: totalAttack,
						rolls: [
							{
								dieType: `d20 (${action.statModifier}: ${modifier >= 0 ? '+' : ''}${modifier})`,
							},
						],
					},
				]);
			} catch (error) {
				console.error('Error rolling attack dice:', error);
				return;
			}
		} else {
			// Handle damage roll directly
			try {
				setIsDamageRoll(true);
				const damageNotations = action.damageDice.map((die) => `${die.quantity}${die.dieType}`);
				if (damageNotations.length > 0) {
					setResults([]);
					setIsRandomizing(true);
					await diceBox.roll(damageNotations);
				}
			} catch (error) {
				console.error('Error rolling damage dice:', error);
			}
		}
	};

	const handleHitConfirmation = async (didHit: boolean) => {
		const diceBox = diceBoxRef.current;
		if (!pendingAction || !diceBox) {
			return;
		}

		setD20Result(null);
		setPendingAction(null);

		if (!didHit) {
			return;
		}

		try {
			setLastRolledAction(null);
			setIsDamageRoll(true);
			const damageNotations = pendingAction.damageDice.map((die) => `${die.quantity}${die.dieType}`);
			if (damageNotations.length > 0) {
				setResults([]);
				await diceBox.roll(damageNotations);
			}
		} catch (error) {
			console.error('Error rolling damage dice:', error);
		}
	};

	const renderHitConfirmation = () => {
		if (!d20Result || !pendingAction) return null;

		const rollText = d20Result.rolls.length > 1 ? `Rolled ${d20Result.rolls.join(' and ')}` : `Rolled ${d20Result.rolls[0]}`;

		const modifierText =
			d20Result.modifier !== 0
				? ` with ${d20Result.modifier > 0 ? '+' : ''}${d20Result.modifier} modifier for a total of ${d20Result.finalValue}`
				: ` for a total of ${d20Result.finalValue}`;

		return (
			<Alert
				title='Did I Hit...?'
				variant='light'
				color='blue'
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					zIndex: 1000,
					maxWidth: '400px',
					width: '90%',
				}}
			>
				<Stack gap='md'>
					<Text>
						{rollText}
						{modifierText}
						{d20Result.rolls.length > 1 && (
							<Text component='span' fw={700}>
								{' '}
								= {d20Result.finalValue}
							</Text>
						)}
					</Text>
					<Group justify='flex-end'>
						<Button variant='filled' color='red' leftSection={<IconX size={16} />} onClick={() => handleHitConfirmation(false)}>
							No
						</Button>
						<Button variant='filled' color='green' leftSection={<IconCheck size={16} />} onClick={() => handleHitConfirmation(true)}>
							Yes
						</Button>
					</Group>
				</Stack>
			</Alert>
		);
	};

	return (
		<div id={'dicebox-container'} className={styles.container}>
			{/* Header */}
			<div className={`${styles.diffusedBackground} ${styles.header}`}>
				<div className={styles.headerContent}>
					<Group justify='space-between' align='center'>
						<Button variant='subtle' onClick={() => setShowResults(!showResults)} disabled={results.length === 0} className={styles.totalButton}>
							<Text size='xl' fw={700} className={styles.totalText}>
								{`${lastActionName ? `${lastActionName}: ` : ''}Total ${isRandomizing ? displayTotal : results.reduce((acc, r) => acc + r.value, 0)}`}
							</Text>
						</Button>
						<ActionIcon variant='subtle' onClick={() => setShowActions(!showActions)} size='lg'>
							{showActions ? <IconChevronRight size={24} /> : <IconChevronLeft size={24} />}
						</ActionIcon>
					</Group>
				</div>

				{/* Results Panel */}
				<Transition
					mounted={showResults}
					transition={{
						in: { opacity: 1, transform: 'translateY(0)' },
						out: { opacity: 0, transform: 'translateY(-20px)' },
						common: { transition: 'opacity 400ms ease, transform 400ms ease' },
						transitionProperty: 'opacity, transform',
					}}
				>
					{(_styles) => (
						<div className={styles.resultsContainer} style={_styles}>
							<SimpleGrid cols={4} spacing='md'>
								{results.map((r, index) => (
									<div
										key={`${index}-${r.qty}${r.rolls[0].dieType}-${r.value}`}
										role='article'
										aria-label={`Dice roll result: ${r.qty}${r.rolls[0].dieType} rolled ${r.value}`}
										className={styles.resultCard}
										tabIndex={0}
									>
										<Text fw={500} className={styles.dieType}>
											{r.qty}
											{r.rolls[0].dieType}
										</Text>
										<Text size='xl' fw={700} className={styles.dieValue}>
											{r.value}
										</Text>
									</div>
								))}
							</SimpleGrid>
						</div>
					)}
				</Transition>
			</div>

			{/* Main DiceBox Container */}
			<div className={styles.mainContainer}>
				{isLoading && (
					<Center className={styles.loader}>
						<Loader size='xl' />
					</Center>
				)}
				{renderHitConfirmation()}
				<div ref={containerRef} id={containerId.current} data-testid='dice-container' className={styles.diceContainer} />
			</div>

			{/* Actions Drawer */}
			<Drawer
				opened={showActions}
				onClose={() => setShowActions(false)}
				position='right'
				size='md'
				title='Actions'
				withinPortal={false}
				styles={{
					root: {
						position: 'absolute',
						height: '100%',
					},
					body: {
						padding: 0,
					},
				}}
			>
				<div className={styles.actionWrapper}>
					{actions.map((action) => (
						<div key={action.id} className={styles.actionGroup}>
							{action.requiresD20 ? (
								<Group gap={0} className={styles.actionGroup}>
									<Button onClick={() => performActionRoll(action, 'normal')} className={styles.actionButton}>
										{action.name}
									</Button>
									<Menu>
										<Menu.Target>
											<ActionIcon variant='filled' size={36} className={styles.dropdownButton}>
												<IconChevronDown size={16} stroke={1.5} />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Item onClick={() => performActionRoll(action, 'advantage')}>Advantage</Menu.Item>
											<Menu.Item onClick={() => performActionRoll(action, 'disadvantage')}>Disadvantage</Menu.Item>
										</Menu.Dropdown>
									</Menu>
								</Group>
							) : (
								<Button fullWidth onClick={() => performActionRoll(action)}>
									{action.name}
								</Button>
							)}
						</div>
					))}
				</div>
			</Drawer>

			{/* Footer */}
			<div className={`${styles.diffusedBackground} ${styles.footer}`}>
				<Group justify='space-between' align='center'>
					<ActionIcon
						variant='light'
						size={48}
						onClick={async () => {
							setLastActionName('D20 Check');
							if (diceBoxRef.current) {
								setResults([]);
								setIsRandomizing(true);
								setIsDamageRoll(false);
								const results = await diceBoxRef.current.roll(['1d20']);
								setDisplayTotal(results[0].value);
								setResults([
									{
										qty: 1,
										value: results[0].value,
										rolls: [{ dieType: 'd20' }],
									},
								]);
							}
						}}
						color='blue'
					>
						{'d20'}
					</ActionIcon>
					<Button
						onClick={async () => {
							if (results.length > 0 && diceBoxRef.current) {
								// If we have a lastRolledAction and it required a d20, handle it like a new action roll

								if (lastRolledAction?.requiresD20) {
									await performActionRoll(lastRolledAction, 'normal');
									return;
								}

								// Otherwise, perform a simple reroll
								const notations = results.map((roll) => `${roll.qty}${roll.rolls[0].dieType}`);
								setResults([]);
								setIsRandomizing(true);
								await diceBoxRef.current.roll(notations);
							}
						}}
						size='lg'
						className={styles.rerollButton}
						disabled={results.length === 0}
					>
						{'Reroll'}
					</Button>
					<ActionIcon variant='light' size={48} onClick={() => toggleShowDiceBox()} color='gray'>
						<IconSettings size={36} />
					</ActionIcon>
				</Group>
			</div>
		</div>
	);
};

export default DiceBoxComponent;
