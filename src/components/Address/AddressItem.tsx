import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon_Delete from '../../../assets/SVG/Icon_Delete';
import Icon_Edit from '../../../assets/SVG/Icon_Edit';
import Icon_Location from '../../../assets/SVG/Icon_Location';
import { COLORS, TYPOGRAPHY } from '../../theme';

type AddressItemProps = {
  address: Address;
  isSelected?: boolean;
  onSelect?: (address: Address) => void;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
};

const AddressItem: React.FC<AddressItemProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const handlePress = () => {
    if (onSelect) {
      onSelect(address);
    }
  };

  const Container = onSelect ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
      onPress={onSelect ? handlePress : undefined}
      activeOpacity={onSelect ? 0.7 : undefined}>
      <View style={styles.itemHeader}>
        <View style={styles.iconContainer}>
          <Icon_Location
            color={isSelected ? COLORS.primaryColor : COLORS.foregroundColor}
          />
        </View>
        <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
          {address.title}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onEdit(address)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon_Edit color={COLORS.secondaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onDelete(address)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon_Delete color={COLORS.errorColor} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemDescription}>
        {address.building} {address.floor}{' '}
        {address.additional_info ? `| ${address.additional_info}` : ''}
      </Text>
    </Container>
  );
};

export default AddressItem;

const styles = StyleSheet.create({
  itemContainer: {
    gap: 8,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  itemContainerSelected: {
    borderColor: COLORS.primaryColor,
    borderWidth: 2,
    backgroundColor: COLORS.lightColor,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  itemName: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.black,
    flex: 1,
    fontWeight: '600',
  },
  itemNameSelected: {
    color: COLORS.primaryColor,
  },
  itemDescription: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    marginLeft: 32,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
});
