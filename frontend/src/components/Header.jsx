import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'

const Header = () => {
	return (
		<header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
			<nav aria-label="Main navigation" className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link to="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<img src="/logo.png" alt="BharatCred logo" width="48" height="48" fetchPriority="high" className="h-12 w-12 object-contain" />
					<span className="text-lg font-semibold tracking-wide text-foreground">BHARATCRED</span>
				</Link>

				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="outline" className="px-6">Sign In</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button className="px-6">Sign Up</Button>
						</SignUpButton>
					</SignedOut>

					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</nav>
		</header>
	)
}

export default Header;
