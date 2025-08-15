/**
 * Frontend authentication service
 * Handles login, signup, logout, and authentication state
 */

export interface User {
  id: string;
  email: string;
  created_at: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null
  };
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Add listener for auth state changes
   */
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.authState);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Update authentication state
   */
  private setState(state: Partial<AuthState>) {
    this.authState = { ...this.authState, ...state };
    this.notify();
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return this.authState;
  }

  /**
   * Check if user is authenticated by calling /api/me
   */
  async checkAuthStatus(): Promise<void> {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.setState({
          isAuthenticated: true,
          user: data.user
        });
      } else {
        this.setState({
          isAuthenticated: false,
          user: null
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.setState({
        isAuthenticated: false,
        user: null
      });
    }
  }

  /**
   * Sign up new user
   */
  async signup(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          isAuthenticated: true,
          user: data.user
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.setState({
          isAuthenticated: true,
          user: data.user
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setState({
        isAuthenticated: false,
        user: null
      });
    }
  }

  /**
   * Sync local data to cloud after login/signup
   */
  async syncLocalDataToCloud(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get local data from localStorage
      const localData = localStorage.getItem('adhd-hub-data');
      if (!localData) {
        return { success: true }; // No data to sync
      }

      const parsedData = JSON.parse(localData);

      // Prepare data for sync API
      const syncData = {
        resources: parsedData.resources || [],
        sessions: parsedData.sessions || [],
        goals: parsedData.goals || [],
        settings: parsedData.settings
      };

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(syncData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data synced to cloud:', result.synced);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Sync failed' };
      }
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: 'Network error' };
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService();