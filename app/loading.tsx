import { View, StyleSheet, useWindowDimensions, SafeAreaView } from 'react-native'
import React, { useMemo } from 'react'
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'

// Extract colors and configuration constants
const SKELETON_CONFIG = {
    backgroundColor: '#f3f3f3',
    foregroundColor: '#ecebeb',
    speed: 1,
    contentListItems: 4
}

// Header skeleton component
const HeaderSkeleton = ({ width }) => (
    <ContentLoader
        speed={SKELETON_CONFIG.speed}
        width={width}
        height={60}
        viewBox={`0 0 ${width} 60`}
        backgroundColor={SKELETON_CONFIG.backgroundColor}
        foregroundColor={SKELETON_CONFIG.foregroundColor}
        aria-label="Loading header"
    >
        <Rect x="20" y="20" rx="4" ry="4" width="120" height="20" />
        <Circle cx={width - 35} cy="30" r="20" />
    </ContentLoader>
)

// Hero skeleton component
const HeroSkeleton = ({ width }) => (
    <ContentLoader
        speed={SKELETON_CONFIG.speed}
        width={width}
        height={200}
        viewBox={`0 0 ${width} 200`}
        backgroundColor={SKELETON_CONFIG.backgroundColor}
        foregroundColor={SKELETON_CONFIG.foregroundColor}
        aria-label="Loading hero section"
    >
        <Rect x="20" y="20" rx="8" ry="8" width={width - 40} height="160" />
    </ContentLoader>
)

// Content list item skeleton component
const ContentListItemSkeleton = ({ width, index }) => (
    <ContentLoader
        key={index}
        speed={SKELETON_CONFIG.speed}
        width={width}
        height={80}
        viewBox={`0 0 ${width} 80`}
        backgroundColor={SKELETON_CONFIG.backgroundColor}
        foregroundColor={SKELETON_CONFIG.foregroundColor}
        aria-label={`Loading content item ${index + 1}`}
    >
        <Circle cx="40" cy="40" r="25" />
        <Rect x="80" y="20" rx="4" ry="4" width={width - 150} height="10" />
        <Rect x="80" y="40" rx="3" ry="3" width={width - 200} height="10" />
        <Rect x="80" y="60" rx="3" ry="3" width="60" height="10" />
    </ContentLoader>
)

export default function Loading() {
    // Use the window dimensions hook for responsive layout
    const { width } = useWindowDimensions();

    // Memoize the content list items to avoid unnecessary re-renders
    const contentListSkeletons = useMemo(() => {
        return Array(SKELETON_CONFIG.contentListItems).fill(0).map((_, index) => (
            <ContentListItemSkeleton key={index} width={width} index={index} />
        ));
    }, [width]);

    return (
        <SafeAreaView
            style={styles.container}
            accessibilityLabel="Loading content"
            accessibilityHint="Please wait while the content loads"
        >
            <HeaderSkeleton width={width} />
            <HeroSkeleton width={width} />
            {contentListSkeletons}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 20
    }
})