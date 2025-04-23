import React from 'react';
import { StyleSheet } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';

interface PostOptionsMenuProps {
  visible: boolean;
  post: any;
  position: { x: number, y: number };
  onDismiss: () => void;
  onDelete: (postId: string) => void;
}

const PostOptionsMenu = ({ visible, post, position, onDismiss, onDelete }: PostOptionsMenuProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  if (!post) return null;

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={position}
      style={[styles.menu, { backgroundColor: theme.cardBackgroundColor }]}
    >
      <Menu.Item 
        leadingIcon="pencil" 
        onPress={() => {
          onDismiss();
          // Edit functionality would go here
        }} 
        title="Edit Post" 
      />
      <Menu.Item 
        leadingIcon="pin" 
        onPress={() => {
          onDismiss();
          // Pin functionality would go here
        }} 
        title={post.isPinned ? "Unpin Post" : "Pin Post"} 
      />
      <Divider />
      <Menu.Item 
        leadingIcon="delete" 
        onPress={() => {
          onDelete(post.id);
          onDismiss();
        }} 
        title="Delete Post"
        titleStyle={{ color: theme.dangerColor }}
      />
    </Menu>
  );
};

const styles = StyleSheet.create({
  menu: {
    marginTop: 40
  }
});

export default React.memo(PostOptionsMenu);
