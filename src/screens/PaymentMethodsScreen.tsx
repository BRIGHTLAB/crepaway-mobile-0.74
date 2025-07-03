import LottieView from 'lottie-react-native';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';
import CreditCardAnimation from '../../assets/lotties/Credit_Card.json';
import Button from '../components/UI/Button';
import Icon_Add from '../../assets/SVG/Icon_Add';
import {FlatList} from 'react-native-gesture-handler';
import Icon_Cash from '../../assets/SVG/Icon_Cash';
import RadioButton from '../components/UI/RadioButton';

const payments = [
  {
    id: 1,
    name: 'Cash',
    icon: <Icon_Cash />,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
  },
];

const PaymentMethodsScreen = () => {
  const [selectedPayment, setSelectedPayment] = useState(1);
  return (
    <View style={styles.container}>
      {/* <EmptyPaymentsView /> */}
      <FlatList
        data={payments}
        renderItem={({item}) => (
          <PaymentRow
            {...item}
            onSelect={() => setSelectedPayment(item.id)}
            selected={selectedPayment === item.id}
          />
        )}
      />
    </View>
  );
};

const PaymentRow = ({
  name,
  description,
  icon,
  selected,
  onSelect,
}: {
  name: string;
  icon: React.ReactElement;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <View style={styles.paymentRow}>
      <View
        style={{
          gap: 14,
          flex: 1,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
          {icon}
          <Text style={{...TYPOGRAPHY.BODY, color: COLORS.darkColor}}>
            {name}
          </Text>
        </View>
        <Text
          style={{
            ...TYPOGRAPHY.TAGS,
            color: COLORS.darkColor,
          }}>
          {description}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
            marginBottom: 'auto',
          }}>
          {selected ? <Text style={{...TYPOGRAPHY.TAGS}}>Default</Text> : null}
          <View>
            <RadioButton checked={selected} onPress={onSelect} />
          </View>
        </View>
      </View>
    </View>
  );
};

const EmptyPaymentsView = () => {
  const handleAddPayment = () => {};
  return (
    <View style={styles.emptyPaymentsContainer}>
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={CreditCardAnimation}
            style={{width: '100%', height: '100%'}}
            autoPlay
            loop={true}
          />
        </View>
        <Text style={styles.noPaymentTitle}>No payment methods</Text>
        <Text style={styles.noPaymentDescription}>
          Add a new payment method for your future orders
        </Text>
      </View>
      <Button
        onPress={handleAddPayment}
        isLoading={false}
        icon={<Icon_Add color={COLORS.lightColor} />}
        iconPosition="left">
        Add
      </Button>
    </View>
  );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
  },
  emptyPaymentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 24,
  },
  lottieContainer: {
    width: 150,
    height: 150,
  },
  noPaymentTitle: {
    ...TYPOGRAPHY.MAIN_TITLE,
    textAlign: 'center',
    color: COLORS.darkColor,
  },
  noPaymentDescription: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.foregroundColor,
    textAlign: 'center',
  },
  paymentRow: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
