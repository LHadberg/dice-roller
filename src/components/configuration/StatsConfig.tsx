// src/components/configuration/StatsConfig.tsx
import React from 'react';
import { Group, Stack, Text, ActionIcon, Paper } from '@mantine/core';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { Stats } from '../../types/types';

interface StatsConfigProps {
  stats: Stats;
  onUpdate: (stats: Stats) => void;
}

const calculateModifier = (value: number): number => {
  return Math.floor((value - 10) / 2);
};

const StatsConfig: React.FC<StatsConfigProps> = ({ stats, onUpdate }) => {
  const handleStatChange = (statKey: keyof Stats, change: number) => {
    const newValue = stats[statKey].value + change;
    if (newValue >= 0 && newValue <= 20) {
      onUpdate({
        ...stats,
        [statKey]: {
          ...stats[statKey],
          value: newValue,
          modifier: calculateModifier(newValue),
        },
      });
    }
  };

  return (
    <Stack gap="md">
      <Text size="xl" fw={700}>Character Stats</Text>
      {(Object.keys(stats) as Array<keyof Stats>).map((statKey) => (
        <Paper key={statKey} p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text fw={500} size="lg" style={{ textTransform: 'capitalize' }}>
                {statKey}
              </Text>
              <Text size="sm" c="dimmed">
                Value: {stats[statKey].value} (Modifier: {stats[statKey].modifier >= 0 ? '+' : ''}{stats[statKey].modifier})
              </Text>
            </div>
            <Group>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleStatChange(statKey, -1)}
                disabled={stats[statKey].value <= 0}
              >
                <IconMinus size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleStatChange(statKey, 1)}
                disabled={stats[statKey].value >= 20}
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default StatsConfig;