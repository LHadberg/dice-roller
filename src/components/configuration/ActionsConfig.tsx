// src/components/configuration/ActionsConfig.tsx
import React from 'react';
import { Button, Group, Stack, TextInput, Switch, Select, ActionIcon, Paper, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Action, DiceSelections, Stats } from '../../types/types';

interface ActionsConfigProps {
  actions: Action[];
  onUpdate: (actions: Action[]) => void;
}

const ActionsConfig: React.FC<ActionsConfigProps> = ({ actions, onUpdate }) => {
  const diceOptions = [
    { value: 'd4', label: 'D4' },
    { value: 'd6', label: 'D6' },
    { value: 'd8', label: 'D8' },
    { value: 'd10', label: 'D10' },
    { value: 'd12', label: 'D12' },
    { value: 'd20', label: 'D20' },
  ];

  /**
   * TODO: Add localization for stat labels
   */
  const statOptions = [
    { value: 'strength', label: 'Strength' },
    { value: 'dexterity', label: 'Dexterity' },
    { value: 'constitution', label: 'Constitution' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'wisdom', label: 'Wisdom' },
    { value: 'charisma', label: 'Charisma' },
  ];

  const addNewAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      name: '',
      requiresD20: false,
      damageDice: [{ quantity: 1, dieType: 'd6' }],
    };
    onUpdate([...actions, newAction]);
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    onUpdate(newActions);
  };

  const removeAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    onUpdate(newActions);
  };

  const addDamageDie = (actionIndex: number) => {
    const newActions = [...actions];
    newActions[actionIndex].damageDice.push({ quantity: 1, dieType: 'd6' });
    onUpdate(newActions);
  };

  const removeDamageDie = (actionIndex: number, dieIndex: number) => {
    const newActions = [...actions];
    newActions[actionIndex].damageDice = newActions[actionIndex].damageDice.filter(
      (_, i) => i !== dieIndex
    );
    onUpdate(newActions);
  };

  return (
    <Stack gap="md" styles={{ root: { height: '100%' } }}>
      <Group justify="space-between">
        <Text size="xl" fw={700}>Actions</Text>
        <Button onClick={addNewAction} leftSection={<IconPlus size={16} />}>
          {/* TODO: Add localization */}
          Add Action
        </Button>
      </Group>

      {actions.map((action, actionIndex) => (
        <Paper key={action.id} p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <TextInput
                placeholder="Action Name"
                value={action.name}
                onChange={(e) => updateAction(actionIndex, { name: e.target.value })}
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removeAction(actionIndex)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>

            <Switch
              label="Requires Attack Roll (D20)"
              checked={action.requiresD20}
              onChange={(e) => updateAction(actionIndex, { requiresD20: e.currentTarget.checked })}
            />

            {action.requiresD20 && (
              <Select
                label="Stat Modifier"
                data={statOptions}
                value={action.statModifier}
                onChange={(value) => updateAction(actionIndex, { statModifier: value as keyof Stats })}
              />
            )}

            <Text size="sm" fw={500}>Damage Dice</Text>
            {action.damageDice.map((die, dieIndex) => (
              <Group key={`${actionIndex}-${dieIndex}`}>
                <TextInput
                  type="number"
                  placeholder="Quantity"
                  value={die.quantity}
                  onChange={(e) => {
                    const newActions = [...actions];
                    newActions[actionIndex].damageDice[dieIndex].quantity = parseInt(e.target.value) || 1;
                    onUpdate(newActions);
                  }}
                  style={{ width: 100 }}
                />
                <Select
                  data={diceOptions}
                  value={die.dieType}
                  onChange={(value) => {
                    const newActions = [...actions];
                    newActions[actionIndex].damageDice[dieIndex].dieType = value as keyof DiceSelections;
                    onUpdate(newActions);
                  }}
                  style={{ width: 100 }}
                />
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => removeDamageDie(actionIndex, dieIndex)}
                  disabled={action.damageDice.length === 1}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              onClick={() => addDamageDie(actionIndex)}
              leftSection={<IconPlus size={16} />}
            >
              {/* TODO: Add localization */}
              Add Damage Die
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default ActionsConfig;