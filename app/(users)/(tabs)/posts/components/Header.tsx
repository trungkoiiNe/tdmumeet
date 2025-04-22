import React from 'react';
import { Appbar } from 'react-native-paper';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: () => void;
  onMenu?: () => void;
}

const Header = ({ title, subtitle, onSearch, onMenu }: HeaderProps) => {
  return (
    <Appbar.Header>
      <Appbar.Content title={title} subtitle={subtitle} />
      {onSearch && <Appbar.Action icon="magnify" onPress={onSearch} />}
      {onMenu && <Appbar.Action icon="dots-vertical" onPress={onMenu} />}
    </Appbar.Header>
  );
};

export default React.memo(Header);
