import BottomSheet, {
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon_Arrow_Right from '../../../../assets/SVG/Icon_Arrow_Right';
import Icon_Checkmark from '../../../../assets/SVG/Icon_Checkmark';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import Button from '../../UI/Button';
import Input from '../../UI/Input';
import QuantityControl from '../../UI/QuantityControl';
import DynamicSheet from '../DynamicSheet';

export type PaymentMode = 'myOrder' | 'custom' | 'divideBill';

export type ModifierItem = {
    id: number;
    name: string;
    price: number | null;
    quantity: number;
    total_price: number;
    plu: string;
};

export type ModifierGroup = {
    id: number;
    name: string;
    modifier_items: ModifierItem[];
};

export type OrderItem = {
    quantity: number;
    name: string;
    price: number;
    modifier_groups?: ModifierGroup[];
    isMyItem?: boolean;
};

type PartialPaymentSheetProps = {
    total: number;
    remainingAmount: number;
    currency: string;
    currencyCode: string;
    myOrderTotal: number;
    items: OrderItem[];
    totalPersons: number;
    initialMode?: PaymentMode;
    onPay: (amount: number, mode: PaymentMode, selectedItems?: OrderItem[]) => void;
    onCancel: () => void;
};

const PartialPaymentSheet = forwardRef<BottomSheet, PartialPaymentSheetProps>(
    ({ total, remainingAmount, currency, currencyCode, myOrderTotal, items, totalPersons, initialMode, onPay, onCancel }, ref) => {
        const { bottom } = useSafeAreaInsets();
        const [selectedMode, setSelectedMode] = useState<PaymentMode>(initialMode ?? 'myOrder');
        const [customAmount, setCustomAmount] = useState('');
        const [isItemListExpanded, setIsItemListExpanded] = useState(false);

        // Divide bill state
        const [dividePersons, setDividePersons] = useState(totalPersons);
        const [personsPayingFor, setPersonsPayingFor] = useState(1);

        // Sync dividePersons when totalPersons prop changes
        useEffect(() => {
            setDividePersons(totalPersons);
        }, [totalPersons]);

        // Track selected item indices
        const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(() => {
            const initialSet = new Set<number>();
            items.forEach((item, index) => {
                if (item.isMyItem) {
                    initialSet.add(index);
                }
            });
            return initialSet;
        });

        // Sync selectedMode when initialMode prop changes (e.g. when sheet opens from different buttons)
        useEffect(() => {
            if (initialMode) {
                setSelectedMode(initialMode);
            }
        }, [initialMode]);

        // Reinitialize selected items when items prop changes
        useEffect(() => {
            const newSet = new Set<number>();
            items.forEach((item, index) => {
                if (item.isMyItem) {
                    newSet.add(index);
                }
            });
            setSelectedItemIndices(newSet);
        }, [items]);

        // Calculate the total price of an item including its modifiers
        const getItemTotalPrice = useCallback((item: OrderItem): number => {
            let itemTotal = item.price * item.quantity;
            if (item.modifier_groups) {
                item.modifier_groups.forEach(group => {
                    group.modifier_items.forEach(mod => {
                        if (mod.total_price) {
                            itemTotal += mod.total_price;
                        }
                    });
                });
            }
            return itemTotal;
        }, []);

        // Compute the total of selected items
        const selectedItemsTotal = useMemo(() => {
            let sum = 0;
            selectedItemIndices.forEach(index => {
                if (index < items.length) {
                    sum += getItemTotalPrice(items[index]);
                }
            });
            return sum;
        }, [selectedItemIndices, items, getItemTotalPrice]);

        const selectedItemsCount = selectedItemIndices.size;

        const toggleItem = useCallback((index: number) => {
            setSelectedItemIndices(prev => {
                const next = new Set(prev);
                if (next.has(index)) {
                    next.delete(index);
                } else {
                    next.add(index);
                }
                return next;
            });
        }, []);

        const handlePay = useCallback(() => {
            switch (selectedMode) {
                case 'myOrder': {
                    const selected = items.filter((_, i) => selectedItemIndices.has(i));
                    onPay(selectedItemsTotal, 'myOrder', selected);
                    break;
                }
                case 'custom': {
                    const amount = parseFloat(customAmount);
                    if (!isNaN(amount) && amount > 0) {
                        onPay(amount, 'custom');
                    }
                    break;
                }
                case 'divideBill': {
                    const dividedAmount = (total / dividePersons) * personsPayingFor;
                    onPay(dividedAmount, 'divideBill');
                    break;
                }
            }
        }, [selectedMode, customAmount, selectedItemsTotal, selectedItemIndices, items, total, dividePersons, personsPayingFor, onPay]);

        const handleCancel = useCallback(() => {
            onCancel();
            if (ref && typeof ref !== 'function' && ref.current) {
                ref.current.close();
            }
        }, [onCancel, ref]);

        const isPayDisabled =
            (selectedMode === 'myOrder' && selectedItemsCount === 0) ||
            (selectedMode === 'myOrder' && selectedItemsTotal > remainingAmount) ||
            (selectedMode === 'custom' &&
                (customAmount === '' ||
                    isNaN(parseFloat(customAmount)) ||
                    parseFloat(customAmount) <= 0 ||
                    parseFloat(customAmount) > remainingAmount)) ||
            (selectedMode === 'divideBill' && ((total / dividePersons) * personsPayingFor) > remainingAmount);

        const payAmount = useMemo(() => {
            switch (selectedMode) {
                case 'myOrder':
                    return selectedItemsTotal;
                case 'custom': {
                    const amt = parseFloat(customAmount);
                    return !isNaN(amt) && amt > 0 ? amt : 0;
                }
                case 'divideBill':
                    return (total / dividePersons) * personsPayingFor;
                default:
                    return 0;
            }
        }, [selectedMode, selectedItemsTotal, customAmount, total, dividePersons, personsPayingFor]);

        const renderRadio = (mode: PaymentMode) => (
            <View
                style={[
                    styles.radio,
                    selectedMode === mode && styles.radioSelected,
                ]}>
                {selectedMode === mode && <View style={styles.radioInner} />}
            </View>
        );

        const renderCheckbox = (checked: boolean) => (
            <View
                style={[
                    styles.checkbox,
                    checked && styles.checkboxChecked,
                ]}>
                {checked && <Icon_Checkmark color="#FFFFFF" width={14} height={14} />}
            </View>
        );

        const Footer = ({ animatedFooterPosition }: BottomSheetFooterProps) => (
            <BottomSheetFooter
                animatedFooterPosition={animatedFooterPosition}
                style={{ ...styles.footerContainer, paddingBottom: bottom + 16 }}
            >
                <Button disabled={isPayDisabled} onPress={handlePay}>
                    Pay {currency}{payAmount.toFixed(2)}
                </Button>
                <Button variant="outline" onPress={handleCancel}>
                    Cancel
                </Button>
            </BottomSheetFooter>
        );

        return (
            <DynamicSheet ref={ref} onClose={onCancel} footerComponent={Footer}>
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.content,
                        { paddingBottom: bottom + 140 },
                    ]}>
                    {/* Header */}
                    <Text style={styles.title}>Partial payment</Text>
                    <Text style={styles.subtitle}>
                        Please select one of the below options
                    </Text>

                    {/* Total Row */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total ({currencyCode})</Text>
                        <Text style={styles.totalValue}>
                            {currencyCode} {total.toFixed(2)}
                        </Text>
                    </View>

                    {/* Remaining Row */}
                    {remainingAmount < total && (
                        <View style={[styles.totalRow, { marginTop: -8 }]}>
                            <Text style={styles.totalLabel}>Remaining ({currencyCode})</Text>
                            <Text style={[styles.totalValue, { color: COLORS.primaryColor }]}>
                                {currencyCode} {remainingAmount.toFixed(2)}
                            </Text>
                        </View>
                    )}

                    {/* Option: Pay my order */}
                    <View style={styles.optionRow}>
                        <TouchableOpacity
                            style={styles.optionHeaderRow}
                            activeOpacity={0.7}
                            onPress={() => setSelectedMode('myOrder')}>
                            <Text style={styles.optionTextMedium}>
                                Pay my order{' '}
                                <Text style={styles.optionTextBold}>
                                    {currency}{selectedItemsTotal.toFixed(2)}
                                </Text>
                            </Text>
                            {renderRadio('myOrder')}
                        </TouchableOpacity>

                        {/* Item selection list (visible when myOrder is selected) */}
                        {selectedMode === 'myOrder' && items.length > 0 && (
                            <View style={styles.itemListContainer}>
                                {/* Items count + Edit toggle */}
                                <TouchableOpacity
                                    style={styles.itemListHeader}
                                    activeOpacity={0.7}
                                    onPress={() => setIsItemListExpanded(!isItemListExpanded)}>
                                    <Text style={styles.itemCountText}>
                                        {selectedItemsCount} {selectedItemsCount === 1 ? 'Item' : 'Items'}
                                    </Text>
                                    <View style={styles.editToggle}>
                                        <Text style={styles.editText}>
                                            {isItemListExpanded ? 'Collapse' : 'Edit'}
                                        </Text>
                                        <Icon_Arrow_Right
                                            width={16}
                                            height={16}
                                            color={COLORS.primaryColor}
                                            style={{ transform: [{ rotate: isItemListExpanded ? '270deg' : '90deg' }], marginBottom: isItemListExpanded ? 3 : 0, }}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {/* Expanded item list */}
                                {isItemListExpanded && (
                                    <View style={styles.itemList}>
                                        {items.map((item, index) => {
                                            const isSelected = selectedItemIndices.has(index);
                                            return (
                                                <React.Fragment key={index}>
                                                    {index > 0 && (
                                                        <View style={styles.itemSeparator} />
                                                    )}
                                                    <TouchableOpacity
                                                        style={styles.itemRow}
                                                        activeOpacity={0.7}
                                                        onPress={() => toggleItem(index)}>
                                                        <View style={styles.itemInfo}>
                                                            <Text style={styles.itemQuantity}>{item.quantity}</Text>
                                                            <View style={styles.itemNameContainer}>
                                                                <Text style={styles.itemName}>{item.name}</Text>
                                                                {/* Modifier items */}
                                                                {item.modifier_groups?.map(group =>
                                                                    group.modifier_items.map(mod => (
                                                                        <Text key={mod.id} style={styles.modifierText}>
                                                                            {mod.quantity > 1 ? `${mod.quantity}x ` : ''}{mod.name}
                                                                            {mod.price && mod.price > 0 ? ` (+${currency}${mod.price})` : ''}
                                                                        </Text>
                                                                    )),
                                                                )}
                                                            </View>
                                                        </View>
                                                        <View style={styles.itemRight}>
                                                            <Text style={styles.itemPrice}>
                                                                {currency}{getItemTotalPrice(item).toFixed(2)}
                                                            </Text>
                                                            {renderCheckbox(isSelected)}
                                                        </View>
                                                    </TouchableOpacity>
                                                </React.Fragment>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Option: Pay a custom amount */}
                    <TouchableOpacity
                        style={[styles.optionRow, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }]}
                        activeOpacity={0.7}
                        onPress={() => setSelectedMode('custom')}>
                        <Text style={styles.optionTextMedium}>Pay a custom amount</Text>
                        {renderRadio('custom')}
                        {selectedMode === 'custom' && (
                            <View style={{ width: '100%', paddingTop: 16 }}>
                                <Input
                                    placeholder="Enter amount"
                                    value={customAmount}
                                    onChangeText={setCustomAmount}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Option: Divide Bill */}
                    <View style={styles.optionRow}>
                        <TouchableOpacity
                            style={styles.optionHeaderRow}
                            activeOpacity={0.7}
                            onPress={() => setSelectedMode('divideBill')}>
                            <Text style={styles.optionTextMedium}>Divide Bill</Text>
                            {renderRadio('divideBill')}
                        </TouchableOpacity>

                        {selectedMode === 'divideBill' && (
                            <View style={styles.divideBillControls}>
                                <View style={styles.divideBillRow}>
                                    <Text style={styles.divideBillLabel}>Total persons</Text>
                                    <QuantityControl
                                        value={dividePersons}
                                        onIncrease={() => setDividePersons(prev => Math.min(prev + 1, totalPersons))}
                                        onDecrease={() => {
                                            setDividePersons(prev => {
                                                const next = Math.max(1, prev - 1);
                                                // Ensure personsPayingFor doesn't exceed new total
                                                if (personsPayingFor > next) {
                                                    setPersonsPayingFor(next);
                                                }
                                                return next;
                                            });
                                        }}
                                        min={1}
                                        max={totalPersons}
                                    />
                                </View>
                                <View style={styles.divideBillSeparator} />
                                <View style={styles.divideBillRow}>
                                    <Text style={styles.divideBillLabel}>Total persons paying for</Text>
                                    <QuantityControl
                                        value={personsPayingFor}
                                        onIncrease={() => setPersonsPayingFor(prev => Math.min(prev + 1, dividePersons))}
                                        onDecrease={() => setPersonsPayingFor(prev => Math.max(1, prev - 1))}
                                        min={1}
                                        max={dividePersons}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </BottomSheetScrollView>
            </DynamicSheet>
        );
    },
);

export default PartialPaymentSheet;

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    title: {
        ...TYPOGRAPHY.HEADLINE,
        fontFamily: 'Poppins-SemiBold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        ...TYPOGRAPHY.BODY,
        color: COLORS.foregroundColor,
        textAlign: 'center',
        marginBottom: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    totalLabel: {
        ...TYPOGRAPHY.SUB_HEADLINE,
        fontFamily: 'Poppins-Medium',
        color: COLORS.black,
    },
    totalValue: {
        ...TYPOGRAPHY.SUB_HEADLINE,
        fontFamily: 'Poppins-Medium',
        color: COLORS.black,
    },
    optionRow: {
        flexWrap: 'wrap',
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    optionRowSelected: {
        borderColor: COLORS.primaryColor,
    },
    optionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    optionTextMedium: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: COLORS.black,
    },
    optionTextBold: {
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        color: COLORS.black,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.tertiaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: COLORS.primaryColor,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primaryColor,
    },
    // Item list styles
    itemListContainer: {
        width: '100%',
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        overflow: 'hidden',
    },
    itemListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    itemCountText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: COLORS.primaryColor,
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: COLORS.primaryColor,
    },
    editArrow: {
        fontSize: 14,
        color: COLORS.black,
    },
    editArrowUp: {
        transform: [{ rotate: '180deg' }],
    },
    itemList: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        marginHorizontal: 14,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 13,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: COLORS.borderColor,
    },
    itemInfo: {
        flexDirection: 'row',
        flex: 1,
        gap: 10,
    },
    itemQuantity: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: COLORS.black,
        minWidth: 16,
    },
    itemNameContainer: {
        flex: 1,
    },
    itemName: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: COLORS.black,
    },
    modifierText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: COLORS.foregroundColor,
        marginTop: 2,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 8,
    },
    itemPrice: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: COLORS.foregroundColor,
    },
    // Checkbox styles
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.tertiaryColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.primaryColor,
        borderColor: COLORS.primaryColor,
    },
    inputContainer: {
        marginBottom: 12,
    },
    // Divide bill styles
    divideBillControls: {
        width: '100%',
        marginTop: 12,
    },
    divideBillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    divideBillLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: COLORS.black,
        flex: 1,
    },
    divideBillSeparator: {
        height: 1,
        backgroundColor: COLORS.borderColor,
    },
    footerContainer: {
        gap: 12,
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
    },
});
