import React from 'react';
import { Link } from 'wouter';
import { Twitter, Instagram, Facebook, Youtube, Twitch } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-[#0F212E] py-4 md:py-6 px-4 md:px-6 text-[#7F8990] text-xs md:text-sm border-t border-[#172B3A]">
      <div className="md:flex justify-center mb-4 hidden">
        <img src="/images/stake_logo_transparent.png" alt="Stake" className="h-12 md:h-16" />
      </div>
      <div className="text-center mb-3 md:mb-4">
        <p>© 2025 Stake.com | All Rights Reserved.</p>
      </div>
      <div className="flex justify-center space-x-4 mb-6 md:mb-8">
        <Twitter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition" />
        <Instagram className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition" />
        <Facebook className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition" />
        <Youtube className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition" />
        <Twitch className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-foreground transition" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 gap-y-6 max-w-screen-lg mx-auto">
        <div>
          <h4 className="font-medium mb-2 text-foreground">Casino</h4>
          <ul className="space-y-1">
            <li><Link href="/casino" className="hover:text-foreground cursor-pointer">Casino Games</Link></li>
            <li><Link href="/casino" className="hover:text-foreground cursor-pointer">Slots</Link></li>
            <li><Link href="/casino" className="hover:text-foreground cursor-pointer">Live Casino</Link></li>
            <li><Link href="/casino" className="hover:text-foreground cursor-pointer">Game Providers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Sports</h4>
          <ul className="space-y-1">
            <li><Link href="/sports" className="hover:text-foreground cursor-pointer">Sportsbook</Link></li>
            <li><Link href="/sports" className="hover:text-foreground cursor-pointer">Live Sports</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Support</h4>
          <ul className="space-y-1">
            <li><Link href="/help-center" className="hover:text-foreground cursor-pointer">Help Center</Link></li>
            <li><Link href="/fairness" className="hover:text-foreground cursor-pointer">Fairness</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">About Us</h4>
          <ul className="space-y-1">
            <li><Link href="/vip-club" className="hover:text-foreground cursor-pointer">VIP Club</Link></li>
            <li><Link href="/promotions" className="hover:text-foreground cursor-pointer">Promotions</Link></li>
            <li><Link href="/affiliate" className="hover:text-foreground cursor-pointer">Affiliate</Link></li>
            <li><Link href="/sponsorships" className="hover:text-foreground cursor-pointer">Sponsorships</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">Payment Info</h4>
          <ul className="space-y-1">
            <li><Link href="/payment-info" className="hover:text-foreground cursor-pointer">Deposit & Withdrawals</Link></li>
            <li><Link href="/payment-info" className="hover:text-foreground cursor-pointer">Crypto Guide</Link></li>
            <li><Link href="/payment-info" className="hover:text-foreground cursor-pointer">Currency Converter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-foreground">How-to Guides</h4>
          <ul className="space-y-1">
            <li><Link href="/guides" className="hover:text-foreground cursor-pointer">How-to Guides</Link></li>
            <li><Link href="/guides" className="hover:text-foreground cursor-pointer">Online Casino Guide</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
