import { ActionIcon, Tabs } from '@mantine/core';
import StatsConfig from './StatsConfig';
import ActionsConfig from './ActionsConfig';
import PhysicsConfig from './PhysicsConfig';
import VisualsConfig from './VisualsConfig';
import { IconDiceFilled } from '@tabler/icons-react';
import { useLocalStorageConfiguration } from '../../hooks/useLocalStorageConfiguration';
import { defaultConfigs } from '../../constants/defaultConfiguration';

export interface ConfigurationProps {
	toggleShowDiceBox: (value?: React.SetStateAction<boolean> | undefined) => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({ toggleShowDiceBox }) => {
	const configuration = useLocalStorageConfiguration(defaultConfigs);

	console.log('Configuration Rendering');
	const { stats, actions, physicsConfig, visualConfig, handleStatsUpdate, handleActionsUpdate, handlePhysicsUpdate, handleVisualsUpdate } = configuration;
	const tabs = {
		stats: { key: 'stats', label: 'Stats' },
		actions: { key: 'actions', label: 'Actions' },
		physics: { key: 'physics', label: 'Physics' },
		visuals: { key: 'visuals', label: 'Visuals' },
	};
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
			}}
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				background: 'white',
				maxHeight: '100%', // Add max height constraint
				overflow: 'hidden' // Prevent overflow
			}}
		>
			<Tabs
				styles={{
					root: {
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						overflow: 'hidden',
						maxHeight: 'calc(100% - 80px)'
					},
					panel: {
						maxWidth: '100%',

						overflowY: 'auto',
						overflowX: 'hidden',
						flex: 1,
						padding: '0 1rem'
					}
				}}
				defaultValue={tabs.stats.key}
				p={'1rem'}
			>
				<Tabs.List>
					{Object.values(tabs).map((tab) => (
						<Tabs.Tab key={tab.key} value={tab.key}>
							{tab.label}
						</Tabs.Tab>
					))}
				</Tabs.List>

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
					background: 'rgba(255, 255, 255, 0.9)',
					backdropFilter: 'blur(5px)',
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