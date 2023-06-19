import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../common/theme';

const Label = ({ text, ...restProps }) => {
  return (
    <View style={styles.root} {...restProps}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.bgrForPrimary,
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default memo(Label);
