// Mock Firebase implementation - no real persistence, no native modules
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    // Immediately call with current user (null)
    callback(this.currentUser);
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async signInWithEmailAndPassword(email, password) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.currentUser = {
      uid: 'mock-user-123',
      email: email,
      displayName: email.split('@')[0]
    };
    
    // Notify all listeners
    this.authStateListeners.forEach(callback => callback(this.currentUser));
    
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email, password, name) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.currentUser = {
      uid: 'mock-user-' + Date.now(),
      email: email,
      displayName: name
    };
    
    // Notify all listeners
    this.authStateListeners.forEach(callback => callback(this.currentUser));
    
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    // Notify all listeners
    this.authStateListeners.forEach(callback => callback(null));
  }

  async sendPasswordResetEmail(email) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
}

class MockFirestore {
  constructor() {
    this.data = {
      users: {},
      bookings: {},
      reviews: {}
    };
  }

  collection(name) {
    return {
      where: (field, operator, value) => ({
        get: async () => ({
          forEach: (callback) => {
            const collectionData = this.data[name] || {};
            Object.entries(collectionData).forEach(([id, doc]) => {
              if (doc[field] === value) {
                callback({ id, data: () => doc });
              }
            });
          }
        })
      })
    };
  }

  doc(path) {
    const [collectionName, docId] = path.split('/');
    return {
      set: async (data) => {
        if (!this.data[collectionName]) {
          this.data[collectionName] = {};
        }
        this.data[collectionName][docId] = data;
      }
    };
  }
}

// Create mock instances
export const auth = new MockAuth();
export const db = new MockFirestore();

export default {
  auth,
  db
};