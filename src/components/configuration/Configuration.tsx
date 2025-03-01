import { ActionIcon, Tabs } from '@mantine/core';
import StatsConfig from './StatsConfig';
import ActionsConfig from './ActionsConfig';
import PhysicsConfig from './PhysicsConfig';
import VisualsConfig from './VisualsConfig';
import { IconDiceFilled } from '@tabler/icons-react';
import { LocalStorageConfigurationReturn } from '../../hooks/useLocalStorageConfiguration';

export interface ConfigurationProps {
	configuration: LocalStorageConfigurationReturn;
	toggleShowDiceBox: (value?: React.SetStateAction<boolean> | undefined) => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({ configuration, toggleShowDiceBox }) => {
	console.log('Configuration Rendering');
	const { stats, actions, physicsConfig, visualConfig, handleStatsUpdate, handleActionsUpdate, handlePhysicsUpdate, handleVisualsUpdate } = configuration;
	const tabs = {
		stats: { key: 'stats', label: 'Stats' },
		actions: { key: 'actions', label: 'Actions' },
		physics: { key: 'physics', label: 'Physics' },
		visuals: { key: 'visuals', label: 'Visuals' },
	};
	return (
		<div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
			<Tabs
				styles={{
					root: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
					panel: {
						maxWidth: 'calc(100vw - 2rem)',
						overflowY: 'auto',
						flex: 1,
						// msOverflowStyle: 'none', // IE and Edge
						// scrollbarWidth: 'none', // Firefox
						// '&::-webkit-scrollbar': {
						// 	display: 'none', // Chrome, Safari, Opera
						// },
						// position: 'relative',
						// '&::after': {
						// 	content: '""',
						// 	position: 'absolute',
						// 	bottom: 0,
						// 	left: 0,
						// 	right: 0,
						// 	height: '50px',
						// 	background: 'linear-gradient(transparent, white)',
						// 	pointerEvents: 'none',
						// },
					},
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
				}}
			>
				<ActionIcon variant='light' size={48} onClick={() => toggleShowDiceBox()} color='blue'>
					<IconDiceFilled size={36} />
				</ActionIcon>
			</div>
		</div>
	);
};
