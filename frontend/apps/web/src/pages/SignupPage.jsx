import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SignupPage = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		passwordConfirm: '',
		username: ''
	});
	const [loading, setLoading] = useState(false);
	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.passwordConfirm) {
			return toast.error('Passwords do not match');
		}

		setLoading(true);
		try {
			await signup(formData);
			toast.success('Account created successfully');
			navigate('/');
		} catch (error) {
			toast.error(error.message || 'Failed to create account');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								placeholder="john_doe"
								value={formData.username}
								onChange={handleChange}
								className="text-foreground"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								value={formData.email}
								onChange={handleChange}
								required
								className="text-foreground"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								required
								minLength={8}
								className="text-foreground"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passwordConfirm">Confirm Password</Label>
							<Input
								id="passwordConfirm"
								type="password"
								value={formData.passwordConfirm}
								onChange={handleChange}
								required
								minLength={8}
								className="text-foreground"
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Creating account...' : 'Sign Up'}
						</Button>
						<div className="text-sm text-center text-muted-foreground">
							Already have an account?{' '}
							<Link to="/login" className="text-primary hover:underline">
								Login
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default SignupPage;