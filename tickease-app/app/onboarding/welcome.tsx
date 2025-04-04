import React, { useState } from 'react'
import { Alert, View, Text, AppState, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from '@/utils/supabase'
import { router } from 'expo-router'

// Setup auto-refresh for authentication
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert('Please enter both email and password')
            return
        }

        setLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (data) {
            router.push("/myevents")
        }

        if (error) Alert.alert('Sign In Error', error.message)
        setLoading(false)
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Welcome Back</Text>
                <Text style={styles.headerSubtitle}>Sign in to manage your events</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setEmail}
                        value={email}
                        placeholder="email@address.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Enter your password"
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.signInButton, loading && styles.disabledButton]}
                onPress={signInWithEmail}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <View style={styles.noAccountContainer}>
                <Text style={styles.noAccountText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/sign-up')}>
                    <Text style={styles.contactAdminText}>Sign Up!</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF0FF',
        padding: 24,
    },
    headerContainer: {
        marginTop: 48,
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 18,
        color: '#666',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 8,
        color: '#888',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    forgotPassword: {
        textAlign: 'right',
        color: '#6366F1',
        marginBottom: 8,
    },
    signInButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    signInButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    noAccountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    noAccountText: {
        color: '#666',
    },
    contactAdminText: {
        color: '#6366F1',
        fontWeight: '500',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
    },
});