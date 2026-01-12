import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OrderItem } from '../../api/ordersApi';
import { COLORS } from '../../theme';

type Props = {
  item: OrderItem;
  symbol?: string;
};

const Item = ({ item, symbol }: Props) => {
  return (
    <View style={styles.orderItemContainer}>
      <View style={styles.itemDetails}>
        <View style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.quantity}× {item.name}
          </Text>
          <Text style={styles.itemPrice}>
            {symbol || item.symbol} {item.total_price != null ? Number(65).toFixed(2) : ''}
          </Text>
        </View>

        {/* Modifier Groups */}
        {item.modifier_groups && item.modifier_groups.length > 0 && (
          <View style={styles.modifiersContainer}>
            {item.modifier_groups.map(group => (
              <View key={group.id}>
                {group.modifier_items.map(modItem => (
                  <Text key={modItem.id} style={styles.modifierText}>
                    • {modItem.name}
                    {modItem.quantity > 1 ? ` ×${modItem.quantity}` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Special Instruction */}
        {item.special_instruction && (
          <Text style={styles.instructionText} numberOfLines={1}>
            Note: {item.special_instruction}
          </Text>
        )}
      </View>
    </View>
  );
};

export default Item;

const styles = StyleSheet.create({
  orderItemContainer: {
    paddingVertical: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.darkColor,
    flex: 1,
  },
  itemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.secondaryColor,
  },
  modifiersContainer: {
    marginTop: 4,
    marginLeft: 16,
  },
  modifierText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: COLORS.foregroundColor,
  },
  instructionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: COLORS.foregroundColor,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 16,
  },
});

