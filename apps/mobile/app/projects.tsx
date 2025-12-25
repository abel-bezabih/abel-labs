import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  currency: string;
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, get token from AsyncStorage
    const token = ''; // Get from auth context
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch projects:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Projects</Text>
      {projects.length === 0 ? (
        <Text style={styles.emptyText}>No projects yet</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>{item.title}</Text>
              <Text style={styles.projectStatus}>Status: {item.status}</Text>
              <Text style={styles.projectBudget}>
                {item.budget.toLocaleString()} {item.currency}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  projectCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectStatus: {
    color: '#666',
    marginBottom: 4,
  },
  projectBudget: {
    color: '#2563eb',
    fontWeight: '600',
  },
});














