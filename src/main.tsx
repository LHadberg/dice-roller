// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { DiceAppWrapper } from './App';
import '@mantine/core/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<MantineProvider defaultColorScheme='auto'>
			<DiceAppWrapper />
		</MantineProvider>
	</React.StrictMode>
);
