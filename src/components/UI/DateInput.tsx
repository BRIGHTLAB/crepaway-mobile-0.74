import React, {forwardRef} from 'react';
import {Platform, TextInput, TouchableOpacity} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Input from './Input';
import Icon_Calendar from '../../../assets/SVG/Icon_Calendar';

interface DateInputProps {
  value?: Date;
  mode?: 'date' | 'datetime' | 'time';
  onChange?: (date: Date) => void;
  error?: string;
  onSubmitEditing?: () => void;
  placeholder?: string;
  showPicker?: boolean;
  onPickerClose?: () => void;
}

const DateInput = forwardRef<TextInput, DateInputProps>(
  (
    {
      value,
      mode = 'date',
      onChange,
      error,
      onSubmitEditing,
      placeholder = 'Select Date',
      showPicker,
      onPickerClose,
    },
    ref,
  ) => {
    const [isPickerOpen, setIsPickerOpen] = React.useState(false);

    React.useEffect(() => {
      if (showPicker !== undefined) {
        setIsPickerOpen(showPicker);
      }
    }, [showPicker]);

    const handleDateChange = (selectedDate: Date) => {
      try {
        onChange?.(selectedDate);
        setIsPickerOpen(false);
        onPickerClose?.();
      } catch (err) {
        console.error('Error in handleDateChange:', err);
      }
    };

    const formattedDate = React.useMemo(() => {
      try {
        return value
          ? value.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '';
      } catch (err) {
        console.error('Error formatting date:', err);
        return '';
      }
    }, [value]);

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPickerOpen(true)}
          style={{width: '100%'}}>
          <Input
            ref={ref}
            iconLeft={<Icon_Calendar />}
            value={formattedDate}
            error={error}
            editable={false}
            style={{color: 'black'}}
            placeholder={placeholder}
            returnKeyType="next"
            onSubmitEditing={onSubmitEditing}
            pointerEvents="none"
          />
        </TouchableOpacity>
        <DatePicker
          modal
          open={isPickerOpen}
          date={value || new Date()}
          onConfirm={date => {
            handleDateChange(date);
          }}
          onCancel={() => {
            setIsPickerOpen(false);
            onPickerClose?.();
          }}
          mode={mode}
        />
      </>
    );
  },
);

DateInput.displayName = 'DateInput';

export default DateInput;
