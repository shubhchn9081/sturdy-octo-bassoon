import React from 'react';
import { Link } from 'wouter';
import { Twitter, Instagram, Facebook, Youtube, Twitch } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-[#0F212E] py-6 px-6 text-[#7F8990] text-sm border-t border-[#172B3A]">
      <div className="flex justify-center mb-4">
        <img src="/stake_logo_transparent.png" alt="Stake" className="h-8" />
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
