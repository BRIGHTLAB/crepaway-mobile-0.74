import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const MenuItemSkeleton = () => {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        flexWrap="wrap"
        marginTop={32}
        gap={16}>
        {[...Array(4)].map((_, index) => (
          <SkeletonPlaceholder.Item
            key={index}
            width={170}
            borderRadius={8}
            marginBottom={16}>
            <SkeletonPlaceholder.Item
              width="100%"
              height={156}
              borderRadius={8}
            />
            <SkeletonPlaceholder.Item marginTop={8} width="60%" height={16} />
            <SkeletonPlaceholder.Item marginTop={4} width="80%" height={12} />
            <SkeletonPlaceholder.Item marginTop={4} width="40%" height={16} />
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default MenuItemSkeleton;

const styles = StyleSheet.create({});
