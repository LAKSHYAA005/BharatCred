import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/clerk-react'

const Header = () => {
	return (
		<header className="border-b border-white/10">
			<nav className="flex w-full items-center justify-between px-6 py-4 md:px-10 lg:px-14">
				<Link to="/" className="flex items-center gap-3">
					<img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
					<span className="text-lg font-semibold tracking-wide text-white">BHARATCRED</span>
				</Link>

				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="outline" className="px-6 text-white hover:bg-white/10">Sign In</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button variant="outline" className="px-6 text-white hover:bg-white/10">Sign Up</Button>
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
