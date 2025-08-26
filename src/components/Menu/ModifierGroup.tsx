import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '../../theme';
import Checkbox from '../UI/Checkbox';
import ModifierItemCounter from './ModifierItemCounter';

interface ModifierGroupProps {
  group: ModifierGroup;
  selectedModifiers: SelectedModifierGroup[];
  setSelectedModifiers: React.Dispatch<
    React.SetStateAction<SelectedModifierGroup[]>
  >;
}

const ModifierGroup: React.FC<ModifierGroupProps> = ({
  group,
  selectedModifiers,
  setSelectedModifiers,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedModifierItem[]>(
    [],
  );

  console.log('group', group);


  // This effect syncs the selectedModifiers from the parent with the local selectedItems state
  useEffect(() => {
    // Find if this group has selected modifiers
    const existingGroup = selectedModifiers.find(
      m => m.modifier_groups_id === group.modifier_groups_id,
    );

    if (existingGroup && existingGroup.modifier_items.length > 0) {
      console.log(
        'Found selected modifiers for group:',
        group.name,
        existingGroup.modifier_items,
      );
      setSelectedItems(existingGroup.modifier_items);
    }
  }, [selectedModifiers, group.modifier_groups_id]);

  // Original effect for handling default items
  useEffect(() => {
    // Only set defaults if no items are already selected
    if (selectedItems.length > 0) return;

    const defaultItems = group.modifier_items.filter(item => item.is_default);

    if (defaultItems.length > 0) {
      let initialSelections: SelectedModifierItem[] = [];

      if (group.max_quantity === 1) {
        const firstDefault = defaultItems[0];
        initialSelections = [
          {
            plu: firstDefault.plu,
            id: firstDefault.id,
            price: firstDefault.price,
            quantity: 1,
            modifier_items_id: firstDefault.modifier_items_id,
            name: firstDefault.name,
          },
        ];
      } else {
        initialSelections = defaultItems
          .slice(0, group.max_quantity)
          .map(item => ({
            plu: item.plu,
            id: item.id,
            price: item.price,
            quantity: 1,
            modifier_items_id: item.modifier_items_id,
            name: item.name,
          }));
      }

      setSelectedItems(initialSelections);
      updateParentState(initialSelections);
    }
  }, [group.modifier_items]);

  const updateParentState = (items: SelectedModifierItem[]) => {
    if (items.length === 0) {
      setSelectedModifiers(prev =>
        prev.filter(g => g.modifier_groups_id !== group.modifier_groups_id),
      );
    } else {
      const newModifierGroup: SelectedModifierGroup = {
        id: group.id,
        modifier_groups_id: group.modifier_groups_id,
        name: group.name,
        modifier_items: items,
      };

      setSelectedModifiers(prev => {
        const existingGroupIndex = prev.findIndex(
          g => g.modifier_groups_id === group.modifier_groups_id,
        );

        if (existingGroupIndex !== -1) {
          const newModifiers = [...prev];
          newModifiers[existingGroupIndex] = newModifierGroup;
          return newModifiers;
        } else {
          return [...prev, newModifierGroup];
        }
      });
    }
  };

  const handleIncrement = (itemId: number) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      // console.log('existingItem', existingItem);

      // Calculate total quantity of all selected items
      const totalQuantity = prev.reduce((sum, item) => sum + item.quantity, 0);

      if (existingItem) {
        // Check if incrementing would exceed the group's max quantity
        if (totalQuantity >= group.max_quantity) {
          return prev;
        }

        const newItems = prev.map(item =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
        updateParentState(newItems);
        return newItems;
      } else {
        // Check if adding a new item would exceed the group's max quantity
        if (totalQuantity >= group.max_quantity) {
          return prev;
        }

        const item = group.modifier_items.find(item => item.id === itemId);
        if (!item) return prev;

        const newItems = [
          ...prev,
          {
            plu: item.plu,
            id: item.id,
            price: item.price,
            modifier_items_id: item?.modifier_items_id,
            name: item.name,
            quantity: 1,
          },
        ];
        updateParentState(newItems);
        return newItems;
      }
    });
  };

  // Function to reset the quantity of a modifier item
  const handleReset = (itemId: number) => {
    setSelectedItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      updateParentState(newItems);
      return newItems;
    });
  };

  // Function to handle selecting/deselecting a modifier item
  const handleSelectItem = (itemId: number, isChecked: boolean) => {
    setSelectedItems(prev => {
      if (isChecked) {
        // For radio behavior (max_quantity === 1), replace any existing selection
        if (group.max_quantity === 1) {
          const item = group.modifier_items.find(item => item.id === itemId);
          if (!item) return prev;

          const newItems = [
            {
              plu: item.plu,
              id: item.id,
              modifier_items_id: item?.modifier_items_id,
              name: item.name,
              price: item.price,
              quantity: 1,
            },
          ];
          updateParentState(newItems);
          return newItems;
        } else {
          // Calculate total quantity of all selected items
          const totalQuantity = prev.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          // Check if adding a new item would exceed the group's max quantity
          if (totalQuantity >= group.max_quantity) {
            return prev;
          }

          const item = group.modifier_items.find(item => item.id === itemId);
          if (!item) return prev;

          const newItems = [
            ...prev,
            {
              plu: item.plu,
              id: item.id,
              price: item.price,
              modifier_items_id: item?.modifier_items_id,
              name: item.name,
              quantity: 1,
            },
          ];
          updateParentState(newItems);
          return newItems;
        }
      } else {
        const newItems = prev.filter(item => item.id !== itemId);
        updateParentState(newItems);
        return newItems;
      }
    });
  };

  // Check if group is disabled (max_quantity is 0)
  const isGroupDisabled = group.max_quantity === 0;

  if (group.is_available) return null; // had do it this way because the backend returns false

  return (
    <View style={{ gap: 8, opacity: isGroupDisabled ? 0.5 : 1 }}>
      {group.hide_label && ( // had to do it this way because the backend returns false
        <Text
          style={{
            color: isGroupDisabled ? COLORS.foregroundColor : COLORS.darkColor,
            fontSize: 16,
            fontWeight: '500'
          }}>
          {group.name}

          <Text style={{ fontSize: 12, fontWeight: '400' }}>
            &nbsp; (Max Item Quantity: {group?.max_quantity})
          </Text>
        </Text>
      )}
      {group.collapsed && ( // had to do it this way because the backend returns false
        <View style={{ gap: 8 }}>
          {group.modifier_items.map(item => {
            // Check if item is disabled (max_quantity is 0)
            const isItemDisabled = item.max_quantity === 0;

            return (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: isItemDisabled ? 0.5 : 1
                }}>
                {group.max_quantity > 1 && item.max_quantity > 1 ? (
                  <ModifierItemCounter
                    itemId={item.id}
                    count={
                      selectedItems.find(i => i.id === item.id)?.quantity || 0
                    }
                    maxCount={item.max_quantity}
                    onIncrement={isItemDisabled ? () => { } : handleIncrement}
                    onReset={isItemDisabled ? () => { } : handleReset}
                    title={`${item.name} ${group.has_additional_charge ? `$${item.price}` : ''
                      }`}
                  />
                ) : (
                  <Checkbox
                    checked={selectedItems.some(i => i.id === item.id)}
                    onCheck={isItemDisabled ? () => { } : (isChecked => handleSelectItem(item.id, isChecked))}
                    isRadio={group.max_quantity === 1}
                    title={`${item.name} ${group.has_additional_charge && item?.price
                      ? `$${item.price}`
                      : ''
                      }`}
                  />
                )}
              </View>
            )
          })}
        </View>
      )}
    </View>
  );
};

export default ModifierGroup;

// still need to re check all the steps and optimize the logic. but we need to update the backend items so i can test it.
