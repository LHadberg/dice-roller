import * as THREE from 'three';

import { Html, PerspectiveCamera } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';

import './App.css';
import { Configuration } from './components/configuration/Configuration';
import { useLocalStorageConfiguration } from './hooks/useLocalStorageConfiguration';
import { defaultConfigs } from './constants/defaultConfiguration';
import { MantineProvider } from '@mantine/core';
import DiceBoxComponent from './components/DiceBox';

interface DiceBoxContainerProps {
	onClick: () => void;
}
const Thing: React.FC<DiceBoxContainerProps> = ({ onClick }) => {
	console.log('Thing Rendering');
	const ref = useRef();
	const {
		viewport: { width: viewportWidth, height: viewportHeight },
		size,
	} = useThree();
	const configuration = useLocalStorageConfiguration(defaultConfigs);
	const wallThickness = 0.5;

	const wallMeshHorizontal = useLoader(THREE.TextureLoader, '/src/assets/textures/wall/horizontal/wood.jpg');
	const wallMeshVertical = useLoader(THREE.TextureLoader, '/src/assets/textures/wall/vertical/wood.jpg');
	const backgroundMesh = useLoader(THREE.TextureLoader, '/src/assets/textures/background/cardboard.jpg');

	useEffect(() => {
		// Handle horizontal wall textures (top and bottom)
		if (wallMeshHorizontal) {
			wallMeshHorizontal.wrapS = wallMeshHorizontal.wrapT = THREE.RepeatWrapping;

			// Set a consistent real-world scale (e.g. 1 unit = 1 meter)
			const textureScale = 1; // How many texture repeats per unit

			// Width is much larger than height for horizontal walls
			// We want the texture to repeat naturally across the width
			wallMeshHorizontal.repeat.set(viewportWidth * textureScale, 0.5 * textureScale);
		}

		// Handle vertical wall textures (left and right)
		if (wallMeshVertical) {
			wallMeshVertical.wrapS = wallMeshVertical.wrapT = THREE.RepeatWrapping;

			// Set a consistent real-world scale
			const textureScale = 1; // How many texture repeats per unit

			// Height is much larger than width for vertical walls
			// We want the texture to repeat naturally across the height
			wallMeshVertical.repeat.set(0.5 * textureScale, viewportHeight * textureScale);
		}

		// Handle background texture
		if (backgroundMesh) {
			backgroundMesh.wrapS = backgroundMesh.wrapT = THREE.RepeatWrapping;

			// Set a consistent scale for the background
			// This should match the aspect ratio of your viewport
			backgroundMesh.repeat.set(
				1, // Single repeat horizontally
				1 // Single repeat vertically
			);
		}
	}, [wallMeshHorizontal, wallMeshVertical, backgroundMesh, viewportHeight, viewportWidth]);

	const wallMetalness = 0.2;
	const wallRoughness = 0.5;

	return (
		<group onClick={onClick}>
			{/* Top Wall */}
			<mesh position={[0, (viewportHeight - wallThickness) / 2, 0.5]}>
				<boxBufferGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Left Wall */}
			<mesh position={[-(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxBufferGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Right Wall */}
			<mesh position={[(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxBufferGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Bottom Wall */}
			<mesh position={[0, -(viewportHeight - wallThickness) / 2, 0.5]}>
				<boxBufferGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Background */}
			<mesh ref={ref as any} scale={[viewportWidth, viewportHeight, 1]}>
				<boxBufferGeometry attach='geometry' args={[1, 1, 0.1]} />
				<meshStandardMaterial map={backgroundMesh} roughness={0.7} metalness={0.8} />

				{/* <Html transform occlude distanceFactor={1} scale={[0.4, 0.4, 1]} rotation={[0, 0, 0]} position={[0, 0, 1]}>
					<div
						id='pleb'
						style={{
							width: size.width, // Fixed explicit width
							height: size.height, // Fixed explicit height
							fontSize: '1px',
							padding: '0px',
						}}
					>
						<MantineProvider>
							<DiceBoxComponent configuration={configuration} toggleShowDiceBox={onClick} />
						</MantineProvider>
					</div>
				</Html> */}
			</mesh>
		</group>
	);
};

const Diceapp = () => {
	console.log('Diceapp Rendering');
	const { size } = useThree();
	console.debug('🚀 ~ Diceapp ~ size:', size);

	const cameraRef = useRef<THREE.PerspectiveCamera>();
	const [isRotated, setIsRotated] = useState(false);
	const [isZoomedOut, setIsZoomedOut] = useState(false);
	// const [cameraRotation, setCameraRotation] = useState()

	// Create a spring animation from 0 to 180 degrees
	const { rotation } = useSpring({
		rotation: isRotated ? Math.PI : 0,
		config: {
			mass: 1,
			tension: 50,
			friction: 10,
			precision: 0.001,
		},
		onStart: () => {
			setIsZoomedOut(true);
		},
		onResolve: () => {
			setIsZoomedOut(false);
		},
		onChange: (a, b, c) => {
			// console.log(a, b, c)
		},
	});

	const { position } = useSpring({
		position: isZoomedOut ? 5 : 0,
		config: {
			mass: 1,
			tension: 100,
			friction: 15,
			precision: 0.001,
		},
	});

	const toggleCamera = () => {
		setIsRotated(!isRotated);
		//onClick.animation.to
	};
	return (
		<>
			<animated.group rotation-y={rotation}>
				<animated.group position-z={position}>
					<PerspectiveCamera ref={cameraRef as any} makeDefault position={[0, 0, 10]} lookAt={() => [0, 0, 10]} />
				</animated.group>
			</animated.group>
			<Thing onClick={toggleCamera} />

			<ambientLight />
			<pointLight position={[7, 7, 9]} intensity={0.8} />
			<Html transform occlude distanceFactor={10} scale={[0.4, 0.4, 1]} rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
				<div
					id='pleb'
					style={{
						width: size.width, // Fixed explicit width
						height: size.height, // Fixed explicit height
						fontSize: '1px',
						padding: '0px',
					}}
				>
					<MantineProvider>
						<Configuration toggleShowDiceBox={toggleCamera} />
					</MantineProvider>
				</div>
			</Html>
		</>
	);
};

const App = () => {
	console.log('App Rendering');
	return (
		<Canvas>
			<Diceapp />
		</Canvas>
	);
};
export default App;

// import React, { Suspense, useEffect, useRef, useState } from 'react';
// import { Canvas, useThree, Vector3 } from '@react-three/fiber';
// import * as THREE from 'three';
// import { Html, OrbitControls, Box, PerspectiveCamera, Environment } from '@react-three/drei';
// import { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
// import { Configuration } from './components/configuration/Configuration';
// import { LocalStorageConfigurationReturn, useLocalStorageConfiguration } from './hooks/useLocalStorageConfiguration';
// import { defaultConfigs } from './constants/defaultConfiguration';
// import DiceBoxComponent from './components/DiceBox';
// import { AppShell, MantineProvider } from '@mantine/core';
// import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
// import { useSpring, animated } from '@react-spring/three';

// interface ModelProps {
// 	configuration: LocalStorageConfigurationReturn;
// }

// const Model: React.FC<ModelProps> = ({ configuration }) => {
// 	const ref = useRef<any>(null);
// 	const { viewport, size, camera } = useThree();
// 	console.debug('🚀 ~ size:', size);
// 	console.debug('🚀 ~ viewport:', viewport);
// 	console.debug('🚀 ~ camera:', camera);
// 	const cameraRef = useRef<ThreePerspectiveCamera>(null);
// 	const [isRotated, setIsRotated] = useState(false);
// 	const [isZoomedOut, setIsZoomedOut] = useState(false);
// 	// const [cameraRotation, setCameraRotation] = useState()

// 	// Create a spring animation from 0 to 180 degrees
// 	const { rotation } = useSpring({
// 		rotation: isRotated ? Math.PI : 0,
// 		config: {
// 			mass: 1,
// 			tension: 50,
// 			friction: 10,
// 			precision: 0.001,
// 		},
// 		onStart: () => {
// 			setIsZoomedOut(true);
// 		},
// 		onResolve: () => {
// 			setIsZoomedOut(false);
// 		},
// 		onChange: (a, b, c) => {
// 			// console.log(a, b, c)
// 		},
// 	});

// 	const { position } = useSpring({
// 		position: isZoomedOut ? 5 : 0,
// 		config: {
// 			mass: 1,
// 			tension: 100,
// 			friction: 15,
// 			precision: 0.001,
// 		},
// 	});

// 	const toggleCamera = () => {
// 		setIsRotated(!isRotated);
// 		//onClick.animation.to
// 	};

// 	return (
// 		<>
// 			<animated.group rotation-y={rotation}>
// 				<animated.group position-z={position}>
// 					<PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} lookAt={() => [0, 0, 0]} />
// 				</animated.group>
// 			</animated.group>

// 			<ambientLight />

// 			<pointLight position={[10, 10, 10]} intensity={1.5} />

// 			{/* //DiceBox Component
// 			<Html transform occlude scale={[viewport.width, viewport.width, 1]} distanceFactor={10} rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
// 				<MantineProvider>
// 					<AppShell id={'dicebox-dice-shell'}>
// 						<DiceBoxComponent configuration={configuration} toggleShowDiceBox={toggleCamera} />
// 					</AppShell>
// 				</MantineProvider>
// 			</Html> */}

// 			{/* DiceBox Container */}
// 			<DiceBoxContainer onClick={toggleCamera} />

// 			{/* Configuration Component */}
// 			<Html transform occlude scale={[viewport.width, viewport.width, 1]} distanceFactor={10} rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
// 				<MantineProvider>
// 					<AppShell style={{ height: '100vh' }} id={'dicebox-configuration-shell'}>
// 						<Configuration configuration={configuration} toggleShowDiceBox={toggleCamera} />
// 					</AppShell>
// 				</MantineProvider>
// 			</Html>
// 		</>
// 	);
// };
// interface DiceBoxContainerProps {
// 	onClick: () => void;
// }
// const DiceBoxContainer: React.FC<DiceBoxContainerProps> = ({ onClick }) => {
// 	const { viewport } = useThree();
// 	const ref = useRef<THREE.Mesh>(null);
// 	const viewportWidth = viewport.width; // - 0.5
// 	const viewportHeight = viewport.height; // - 0.5
// 	const wallThickness = 0.5;
// 	return (
// 		<group onClick={onClick}>
// 			<mesh position={[0, -(viewportHeight - wallThickness) / 2, 0.5]}>
// 				<boxBufferGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
// 				<meshStandardMaterial color='blue' />
// 			</mesh>
// 			<mesh position={[0, (viewportHeight - wallThickness) / 2, 0.5]}>
// 				<boxBufferGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
// 				<meshStandardMaterial color='blue' />
// 			</mesh>
// 			<mesh position={[-(viewportWidth - wallThickness) / 2, 0, 0.5]}>
// 				<boxBufferGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
// 				<meshStandardMaterial color='blue' />
// 			</mesh>
// 			<mesh position={[(viewportWidth - wallThickness) / 2, 0, 0.5]}>
// 				<boxBufferGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
// 				<meshStandardMaterial color='blue' />
// 			</mesh>
// 			<mesh ref={ref} scale={[viewportWidth, viewportHeight, 1]}>
// 				<boxBufferGeometry attach='geometry' args={[1, 1, 0.1]} />
// 				<meshStandardMaterial color='red' />
// 			</mesh>
// 		</group>
// 	);
// };

// const App: React.FC = () => {
// 	const configuration = useLocalStorageConfiguration(defaultConfigs);

// 	return (
// 		// <Canvas id={'dicebox-outer-canvas'}>
// 		<Canvas>
// 			<Suspense fallback={null}>
// 				<Model configuration={configuration} />
// 			</Suspense>
// 		</Canvas>
// 	);
// };

// export default App;
