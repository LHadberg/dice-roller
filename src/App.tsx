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
	configuration: ReturnType<typeof useLocalStorageConfiguration>;
}

const Thing: React.FC<DiceBoxContainerProps> = ({ onClick, configuration }) => {
	console.log('Thing Rendering');
	const ref = useRef();
	const {
		viewport: { width: viewportWidth, height: viewportHeight },
		size,
	} = useThree();
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
		// <group onClick={onClick}>
		<group onClick={onClick}>
			{/* Top Wall */}
			<mesh position={[0, (viewportHeight - wallThickness) / 2, 0.5]}>
				<boxGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Left Wall */}
			<mesh position={[-(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Right Wall */}
			<mesh position={[(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Bottom Wall */}
			<mesh position={[0, -(viewportHeight - wallThickness) / 2, 0.5]}>
				<boxGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Background */}
			<mesh ref={ref as any} scale={[viewportWidth, viewportHeight, 1]}>
				<boxGeometry attach='geometry' args={[1, 1, 0.1]} />
				<meshStandardMaterial map={backgroundMesh} roughness={0.7} metalness={0.8} />
			</mesh>
		</group>
	);
};

interface DiceAppProps {
	configuration: ReturnType<typeof useLocalStorageConfiguration>;
}

export const DiceApp: React.FC<DiceAppProps> = ({ configuration }) => {
	console.log('Dice-App Rendering');
	const { size } = useThree();
	console.debug('🚀 ~ Diceapp ~ size:', size);

	const cameraRef = useRef<THREE.PerspectiveCamera>();
	const [isRotated, setIsRotated] = useState(false);
	const [isZoomedOut, setIsZoomedOut] = useState(false);
	const [showDiceBox, setShowDiceBox] = useState(true);
	const [showConfiguration, setShowConfiguration] = useState(false);
	const [diceBoxMounted, setDiceBoxMounted] = useState(false);

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

	useEffect(() => {
		// Set a timeout to ensure the DiceBox mounts after the 3D environment is ready
		const timer = setTimeout(() => {
			setDiceBoxMounted(true);
		}, 500);
		
		return () => clearTimeout(timer);
	}, []);

	const toggleCamera = () => {
		setIsRotated(!isRotated);
		
		// Add a small delay before toggling the components to allow for animation
		setTimeout(() => {
			setShowDiceBox(!showDiceBox);
			setShowConfiguration(!showConfiguration);
		}, 300);
	};

	const toggleShowDiceBox = (value?: React.SetStateAction<boolean> | undefined) => {
		const newValue = value !== undefined ? 
			(typeof value === 'function' ? (value as Function)(showDiceBox) : value) : 
			!showDiceBox;
		
		// If we're currently on the DiceBox side, trigger the camera rotation
		if (!isRotated) {
			toggleCamera();
		} else {
			// If we're on the configuration side already, just update the state
			setShowDiceBox(newValue);
			setShowConfiguration(!newValue);
		}
	};

	return (
		<>
			<animated.group rotation-y={rotation}>
				<animated.group position-z={position}>
					<PerspectiveCamera ref={cameraRef as any} makeDefault position={[0, 0, 10]} lookAt={() => [0, 0, 10]} />
				</animated.group>
			</animated.group>
			<Thing 
				onClick={toggleCamera} 
				configuration={configuration} 
			/>

			<ambientLight />
			<pointLight position={[7, 7, 9]} intensity={0.8} />
			
			{/* DiceBox Component (frontside) */}
			{showDiceBox && diceBoxMounted && !isRotated && (
				<Html transform occlude distanceFactor={10} scale={[0.4, 0.4, 1]} rotation={[0, 0, 0]} position={[0, 0, 1]}>
					<div
						style={{
							width: size.width,
							height: size.height,
							padding: '0',
						}}
					>
						<MantineProvider>
							<DiceBoxComponent 
								configuration={configuration} 
								toggleShowDiceBox={toggleShowDiceBox} 
							/>
						</MantineProvider>
					</div>
				</Html>
			)}
			
			{/* Configuration Panel (backside) */}
			{showConfiguration && (
				<Html transform occlude distanceFactor={10} scale={[0.4, 0.4, 1]} rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
					<div
						style={{
							width: size.width,
							height: size.height,
							padding: '0px',
						}}
					>
						<MantineProvider>
							<Configuration toggleShowDiceBox={toggleCamera} />
						</MantineProvider>
					</div>
				</Html>
			)}
		</>
	);
};

export const DiceAppWrapper = () => {
	const configuration = useLocalStorageConfiguration(defaultConfigs);
	
	return (
		<Canvas>
			<DiceApp configuration={configuration} />
		</Canvas>
	);
};