import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Box, PerspectiveCamera, Environment } from '@react-three/drei';
import { Configuration } from './components/configuration/Configuration';
import { LocalStorageConfigurationReturn, useLocalStorageConfiguration } from './hooks/useLocalStorageConfiguration';
import { defaultConfigs } from './constants/defaultConfiguration';
import DiceBoxComponent from './components/DiceBox';
import { AppShell, MantineProvider } from '@mantine/core';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
interface ModelProps {
	orbitRef: React.RefObject<OrbitControlsImpl>;
	configuration: LocalStorageConfigurationReturn;
}

const Model: React.FC<ModelProps> = ({ orbitRef, configuration }) => {
	const ref = useRef<any>(null);
	const { viewport, size, camera } = useThree();
	console.debug('🚀 ~ size:', size);
	console.debug('🚀 ~ viewport:', viewport);
	console.debug('🚀 ~ camera:', camera);
	const [cameraRotation, setCameraRotation] = useState<'configuration' | 'dicebox'>('configuration');
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Update dimensions after first render
	useEffect(() => {
		const currentViewport = viewport.getCurrentViewport(camera);
		console.debug('🚀 ~ useEffect ~ currentViewport:', currentViewport);
		setDimensions({
			width: size.width,
			height: size.height,
		});
	}, [camera, viewport]);
	console.log('dimensions:', dimensions);

	const rotateCamera = () => {
		if (cameraRotation === 'configuration' && orbitRef.current) {
			orbitRef.current.setAzimuthalAngle(Math.PI);
			orbitRef.current.update();
		} else if (cameraRotation === 'dicebox' && orbitRef.current) {
			orbitRef.current.setAzimuthalAngle(0);
			orbitRef.current.update();
		}
	};

	const changeCameraRotation = () => {
		if (cameraRotation === 'configuration') {
			setCameraRotation('dicebox');
		} else {
			setCameraRotation('configuration');
		}

		rotateCamera();
	};

	return (
		<group ref={ref}>
			<mesh>
				<axesHelper args={[5]} />
				<Box args={[viewport.width, viewport.height, 3]} position={[0, 0, 0]}>
					<meshStandardMaterial color='orange' />
				</Box>

				{/* DiceBox Component */}
				<Html
					transform
					position={[0, 0, -1.50000001]} // Moved slightly back
					rotation={[0, Math.PI, 0]}
					// occlude={cameraRotation === 'configuration'} // Only occlude when active
					style={{height: size.height, width: size.width}}
				>
					<MantineProvider>
						<AppShell id={'dicebox-dice-shell'}>
							<DiceBoxComponent configuration={configuration} toggleShowDiceBox={changeCameraRotation} />
						</AppShell>
					</MantineProvider>
				</Html>

				{/* Configuration Component */}
				<Html
					transform
					fullscreen
					position={[0, 0, 1.50000001]} // Moved slightly forward
					// occlude={cameraRotation === 'dicebox'} // Only occlude when active
					style={{height: '100vh', width: size.width}}
				>
					<MantineProvider>
						<AppShell style={{height: '100vh'}} id={'dicebox-configuration-shell'}>
							<Configuration configuration={configuration} toggleShowDiceBox={changeCameraRotation} />
						</AppShell>
					</MantineProvider>
				</Html>
			</mesh>
		</group>
	);
};

const App: React.FC = () => {
	const configuration = useLocalStorageConfiguration(defaultConfigs);
	const orbitRef = useRef<OrbitControlsImpl>(null);

	return (
		<Canvas id={'dicebox-outer-canvas'}  style={{ height: '100vh', width: '100vw' }}>
			<Suspense fallback={null}>
				<Model configuration={configuration} orbitRef={orbitRef} />
			</Suspense>
			<PerspectiveCamera makeDefault position={[0, 0, 32]} />
			<OrbitControls
				ref={orbitRef}
				// autoRotate={true}
				enableZoom={false}
				// enablePan={false}
				minPolarAngle={Math.PI / 2}
				maxPolarAngle={Math.PI / 2}
				// minAzimuthAngle={0}
				// maxAzimuthAngle={0}
				// enableDamping={false}
				// dampingFactor={0}
				// rotateSpeed={0}
			/>
			<Environment preset='city' />
		</Canvas>
	);
};

export default App;
