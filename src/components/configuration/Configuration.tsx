import React, { useState } from 'react';
import { ActionIcon, Button, Group, Tabs, useComputedColorScheme } from '@mantine/core';
import StatsConfig from './StatsConfig';
import ActionsConfig from './ActionsConfig';
import PhysicsConfig from './PhysicsConfig';
import VisualsConfig from './VisualsConfig';
import { IconDiceFilled } from '@tabler/icons-react';
import { LocalStorageConfigurationReturn } from '../../hooks/useLocalStorageConfiguration';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/Configuration.module.css';

const LAST_TAB_KEY = 'dice-roller-last-config-tab';

export interface ConfigurationProps {
	toggleShowDiceBox: (value?: React.SetStateAction<boolean> | undefined) => void;
	configuration: LocalStorageConfigurationReturn;
}

export const Configuration: React.FC<ConfigurationProps> = ({ toggleShowDiceBox, configuration }) => {
	const isDark = useComputedColorScheme('light') === 'dark';
	const { t, i18n } = useTranslation();

	const { stats, actions, physicsConfig, visualConfig, handleStatsUpdate, handleActionsUpdate, handlePhysicsUpdate, handleVisualsUpdate } = configuration;
	const tabs = {
		stats: { key: 'stats', label: t('tabs.stats') },
		actions: { key: 'actions', label: t('tabs.actions') },
		physics: { key: 'physics', label: t('tabs.physics') },
		visuals: { key: 'visuals', label: t('tabs.visuals') },
	};

	const validKeys = Object.keys(tabs);
	const savedTab = localStorage.getItem(LAST_TAB_KEY);
	const [activeTab, setActiveTab] = useState<string>(
		savedTab && validKeys.includes(savedTab) ? savedTab : tabs.stats.key
	);

	const handleTabChange = (value: string | null) => {
		if (value) {
			setActiveTab(value);
			localStorage.setItem(LAST_TAB_KEY, value);
		}
	};

	return (
		<div
			className={styles.configWrapper}
			onClick={(e) => {
				e.stopPropagation();
			}}
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				background: isDark ? 'rgba(26, 27, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
				maxHeight: '100%',
				overflow: 'hidden',
				borderRadius: '12px',
				border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
			}}
		>
			<Tabs
				styles={{
					root: {
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						overflow: 'hidden',
						maxHeight: 'calc(100% - 80px)',
					},
					panel: {
						maxWidth: '100%',
						overflowY: 'auto',
						overflowX: 'hidden',
						flex: 1,
						minHeight: 0,
						padding: '0 1rem'
					}
				}}
				value={activeTab}
				onChange={handleTabChange}
				p={'1rem'}
			>
				<Group justify="space-between" align="center" mb="xs">
					<Tabs.List style={{ flex: 1 }}>
						{Object.values(tabs).map((tab) => (
							<Tabs.Tab key={tab.key} value={tab.key}>
								{tab.label}
							</Tabs.Tab>
						))}
					</Tabs.List>
					<Button.Group>
						{(['en', 'da'] as const).map((lng) => (
							<Button
								key={lng}
								size="xs"
								variant={i18n.language.startsWith(lng) ? 'filled' : 'default'}
								onClick={() => i18n.changeLanguage(lng)}
							>
								{lng.toUpperCase()}
							</Button>
						))}
					</Button.Group>
				</Group>

				<Tabs.Panel value='stats' pt='xs'>
					<StatsConfig stats={stats} onUpdate={handleStatsUpdate} />
				</Tabs.Panel>

				<Tabs.Panel value='actions' pt='xs'>
					<ActionsConfig actions={actions} onUpdate={handleActionsUpdate} />
				</Tabs.Panel>

				<Tabs.Panel value='physics' pt='xs'>
					<PhysicsConfig config={physicsConfig} onUpdate={handlePhysicsUpdate} />
				</Tabs.Panel>

				<Tabs.Panel value='visuals' pt='xs'>
					<VisualsConfig config={visualConfig} onUpdate={handleVisualsUpdate} />
				</Tabs.Panel>
			</Tabs>
			<div
				style={{
					padding: '1rem',
					zIndex: 10,
					display: 'flex',
					justifyContent: 'flex-end',
					height: '80px', // Fixed height for the action bar
					boxSizing: 'border-box', // Ensure padding is included in height calculation
				}}
			>
				<ActionIcon variant='light' size={48} onClick={() => toggleShowDiceBox()} color='blue'>
					<IconDiceFilled size={36} />
				</ActionIcon>
			</div>
		</div>
	);
};