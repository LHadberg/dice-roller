// src/components/configuration/DiceConfig.tsx
import React from 'react';
import { NumberInput, Stack, Text } from '@mantine/core';
import { DiceSelections } from '../../types/types';

interface DiceConfigProps {
  selections: DiceSelections;
  onUpdate: (selections: DiceSelections) => void;
}

const DiceConfig: React.FC<DiceConfigProps> = ({ selections, onUpdate }) => {
  const handleUpdate = (type: keyof DiceSelections, value: number) => {
    onUpdate({
      ...selections,
      [type]: value,
    });
  };

  return (
    <Stack gap="md">
      <Text size="xl" fw={700}>
        Select Dice
      </Text>
      {Object.entries(selections).map(([type, count]) => (
        <NumberInput
          key={type}
          label={`${type.toUpperCase()} Dice`}
          value={count}
          min={0}
          max={128}
          onChange={(value) => handleUpdate(type as keyof DiceSelections, Number(value) || 0)} 
        />
      ))}
    </Stack>
  );
};

export default DiceConfig;