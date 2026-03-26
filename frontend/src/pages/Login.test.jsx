// src/pages/Login.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import Login from './Login'; // Adjust path if needed

// Mock dependencies
vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    beforeEach(() => {
        // Reset mocks and localStorage before each test to ensure test isolation
        vi.clearAllMocks();
        localStorage.clear();
    });

    // Helper function to render the component within a Router
    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    it('1. renders the login form correctly', () => {
        renderLogin();

        // Check if essential elements are visible to the user
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('2. validates input fields (required fields)', async () => {
        renderLogin();
        const user = userEvent.setup();
        const submitButton = screen.getByRole('button', { name: /login/i });

        // Click submit without entering any text
        await user.click(submitButton);

        // Check for validation messages (adjust text based on your actual component implementation)
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    it('3. displays error message when login fails', async () => {
        renderLogin();
        const user = userEvent.setup();

        // Mock a failed API response
        axios.post.mockRejectedValueOnce({
            response: { data: { detail: 'Invalid credentials' } }
        });

        // Fill out the form
        await user.type(screen.getByLabelText(/email/i), 'wrong@user.com');
        await user.type(screen.getByLabelText(/password/i), 'badpassword');
        await user.click(screen.getByRole('button', { name: /login/i }));

        // Wait for the error message to appear in the UI
        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    it('4. successful login calls the backend and stores JWT and role in localStorage', async () => {
        renderLogin();
        const user = userEvent.setup();

        // Mock a successful API response
        const mockResponse = {
            data: {
                access_token: 'fake-jwt-token',
                role: 'admin'
            }
        };
        axios.post.mockResolvedValueOnce(mockResponse);

        // Fill out the form
        await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        // Verify the API was called with the correct data
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String), // Matches whatever URL you point to
                expect.objectContaining({
                    email: 'admin@example.com',
                    password: 'password123'
                })
            );
        });

        // Verify caching in localStorage
        expect(localStorage.getItem('token')).toBe('fake-jwt-token'); // Update keys if your app uses different names
        expect(localStorage.getItem('role')).toBe('admin');
    });

    it('5. redirects to home page on successful login', async () => {
        renderLogin();
        const user = userEvent.setup();

        axios.post.mockResolvedValueOnce({
            data: { access_token: 'fake-jwt-token', role: 'admin' }
        });

        await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        // Verify navigation was triggered correctly
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/'); // Assuming '/' is the dashboard/home route
        });
    });
});
