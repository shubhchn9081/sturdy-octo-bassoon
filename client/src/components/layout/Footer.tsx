import React from 'react';
import { Link } from 'wouter';
import { Twitter, Instagram, Facebook, Youtube, Twitch } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-panel-bg py-6 px-6 text-muted-foreground text-sm border-t border-border">
      <div className="flex justify-center mb-4">
        <svg viewBox="0 0 91 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6">
          <path d="M1.6 23L12.4 3.5L23.2 23H1.6Z" fill="#00FF7F"/>
          <path d="M34.6 23V5.3H39.4V23H34.6ZM37 3.9C36.2667 3.9 35.6333 3.65 35.1 3.15C34.5667 2.65 34.3 2.03333 34.3 1.3C34.3 0.566666 34.5667 -0.0500002 35.1 -0.55C35.6333 -1.05 36.2667 -1.3 37 -1.3C37.7333 -1.3 38.3667 -1.06667 38.9 -0.6C39.4333 -0.133334 39.7 0.466666 39.7 1.2C39.7 1.93333 39.4333 2.56667 38.9 3.1C38.3667 3.63333 37.7333 3.9 37 3.9Z" fill="white"/>
          <path d="M51.1 23.3C49.3667 23.3 47.8 22.9667 46.4 22.3C45 21.6333 43.9 20.6833 43.1 19.45C42.3 18.2167 41.9 16.75 41.9 15.05C41.9 13.35 42.3 11.8833 43.1 10.65C43.9 9.41667 45 8.46667 46.4 7.8C47.8 7.13333 49.3667 6.8 51.1 6.8C52.8333 6.8 54.4 7.13333 55.8 7.8C57.2 8.46667 58.3 9.41667 59.1 10.65C59.9 11.8833 60.3 13.35 60.3 15.05C60.3 16.75 59.9 18.2167 59.1 19.45C58.3 20.6833 57.2 21.6333 55.8 22.3C54.4 22.9667 52.8333 23.3 51.1 23.3ZM51.1 19.05C52.4333 19.05 53.4833 18.6333 54.25 17.8C55.0167 16.9667 55.4 16.1833 55.4 15.05C55.4 13.9167 55.0167 13.0333 54.25 12.2C53.4833 11.3667 52.4333 10.95 51.1 10.95C49.7667 10.95 48.7167 11.3667 47.95 12.2C47.1833 13.0333 46.8 13.9167 46.8 15.05C46.8 16.1833 47.1833 17.0667 47.95 17.9C48.7167 18.7333 49.7667 19.15 51.1 19.05Z" fill="white"/>
          <path d="M82.7 23.3C80.5667 23.3 78.6833 22.9167 77.05 22.15C75.4167 21.3833 74.1333 20.2833 73.2 18.85C72.2667 17.4167 71.8 15.75 71.8 13.85C71.8 11.95 72.2667 10.2833 73.2 8.85C74.1333 7.41667 75.4 6.31667 77 5.55C78.6 4.78333 80.4333 4.4 82.5 4.4C84.3 4.4 85.9333 4.71667 87.4 5.35C88.8667 5.98333 90.0333 6.91667 90.9 8.15L87.4 11.2C86.3333 9.8 84.9 9.1 83.1 9.1C81.5 9.1 80.2 9.56667 79.2 10.5C78.2 11.4333 77.7 12.7167 77.7 14.35C77.7 15.55 77.9333 16.5667 78.4 17.4C78.8667 18.2333 79.5 18.8667 80.3 19.3C81.1 19.7333 82.0333 19.95 83.1 19.95C84.0333 19.95 84.8667 19.7667 85.6 19.4C86.3333 19.0333 86.9667 18.5167 87.5 17.85L90.9 21.15C89.9667 21.9167 88.8333 22.5 87.5 22.9C86.1667 23.3 84.9333 23.5167 83.8 23.55C83.4667 23.55 83.1 23.5333 82.7 23.3Z" fill="white"/>
        </svg>
      </div>
      <div className="text-center mb-4">
        <p>© 2025 Stake.com | All Rights Reserved.</p>
      </div>
      <div className="flex justify-center space-x-4 mb-8">
        <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        <Youtube className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
        <Twitch className="h-5 w-5 text-muted-foreground hover:text-foreground transition" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-screen-lg mx-auto">
        <div>
          <h4 className="font-medium mb-2 text-foreground">Casino</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/casino-games'}>Casino Games</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/slots'}>Slots</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/live-casino'}>Live Casino</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/game-providers'}>Game Providers</div></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Sports</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/sportsbook'}>Sportsbook</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/live-sports'}>Live Sports</div></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Support</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/help-center'}>Help Center</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/fairness'}>Fairness</div></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">About Us</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/vip-club'}>VIP Club</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/affiliate'}>Affiliate</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/sponsorships'}>Sponsorships</div></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Payment Info</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/deposits-withdrawals'}>Deposit & Withdrawals</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/crypto-guide'}>Crypto Guide</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/currency-converter'}>Currency Converter</div></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">How-to Guides</h4>
          <ul className="space-y-1">
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/guides'}>How-to Guides</div></li>
            <li><div className="hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/casino-guide'}>Online Casino Guide</div></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
