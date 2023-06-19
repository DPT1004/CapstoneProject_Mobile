import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../common/theme'

const Rail = () => {
  return (
    <View style={styles.root} />
  );
};

export default memo(Rail);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
  },
});
