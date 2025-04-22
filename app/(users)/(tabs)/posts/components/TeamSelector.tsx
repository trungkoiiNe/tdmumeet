import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip, Avatar } from 'react-native-paper';
import { useTeamStore } from '@/stores/teamStore';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';

interface TeamSelectorProps {
  teams: any[];
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
}

const TeamSelector = ({ teams, selectedTeamId, onSelectTeam }: TeamSelectorProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { getAvatarUrl } = useTeamStore();
  const [teamAvatars, setTeamAvatars] = useState<Record<string, string>>({});

  // Fetch team avatars when teams change
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatars: Record<string, string> = {};
      for (const team of teams) {
        try {
          const avatarUrl = await getAvatarUrl(team.id);
          avatars[team.id] = avatarUrl;
        } catch {
          avatars[team.id] = "";
        }
      }
      setTeamAvatars(avatars);
    };

    if (teams.length > 0) fetchAvatars();
  }, [teams, getAvatarUrl]);

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {teams.map((team) => (
          <Chip
            key={team.id}
            selected={selectedTeamId === team.id}
            onPress={() => onSelectTeam(team.id)}
            style={[
              styles.teamChip,
              { backgroundColor: theme.tagBackground },
              selectedTeamId === team.id && { backgroundColor: theme.accentColor }
            ]}
            textStyle={{ color: selectedTeamId === team.id ? theme.buttonText : theme.tagText }}
            avatar={
              teamAvatars[team.id] ? (
                <Avatar.Image size={24} source={{ uri: teamAvatars[team.id] }} />
              ) : (
                <Avatar.Text size={24} label={team.name.substring(0, 2).toUpperCase()} />
              )
            }
          >
            {team.name}
          </Chip>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contentContainer: {
    paddingRight: 8,
  },
  teamChip: {
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minHeight: 36,
    elevation: 1,
    borderRadius: 18
  },
  selectedTeamChip: {}
});

export default React.memo(TeamSelector);
