import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native'
import React from 'react'
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'

const { width } = Dimensions.get('window')

export default function Loading() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header Skeleton */}
            <ContentLoader
                speed={1}
                width={width}
                height={60}
                viewBox={`0 0 ${width} 60`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
            >
                <Rect x="20" y="20" rx="4" ry="4" width="120" height="20" />
                <Circle cx={width - 35} cy="30" r="20" />
            </ContentLoader>

            {/* Hero Skeleton */}
            <ContentLoader
                speed={1}
                width={width}
                height={200}
                viewBox={`0 0 ${width} 200`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
            >
                <Rect x="20" y="20" rx="8" ry="8" width={width - 40} height="160" />
            </ContentLoader>

            {/* Content List Skeleton */}
            {[...Array(4)].map((_, index) => (
                <ContentLoader
                    key={index}
                    speed={1}
                    width={width}
                    height={80}
                    viewBox={`0 0 ${width} 80`}
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                >
                    <Circle cx="40" cy="40" r="25" />
                    <Rect x="80" y="20" rx="4" ry="4" width={width - 150} height="10" />
                    <Rect x="80" y="40" rx="3" ry="3" width={width - 200} height="10" />
                    <Rect x="80" y="60" rx="3" ry="3" width="60" height="10" />
                </ContentLoader>
            ))}
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