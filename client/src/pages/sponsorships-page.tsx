import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Award, Star, Users } from 'lucide-react';
import { SiUfc, SiFcbarcelona, SiFormula1 } from 'react-icons/si';

export default function SponsorshipsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-4 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Award className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">Sponsorships</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Explore our global sports partnerships and sponsorships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <p className="text-[#7F8990] mb-4">
              Stake.com has established itself as a major player in the world of sports sponsorships, 
              partnering with some of the biggest teams, athletes, and events across the globe. 
              Our sponsorships represent our commitment to excellence, innovation, and excitement.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-6">Our Major Partnerships</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-40 bg-[#172B3A] rounded-md flex items-center justify-center mb-4">
                  <SiUfc className="text-[#1375e1] h-20 w-20" />
                </div>
                <h3 className="text-lg font-semibold mb-2">UFC</h3>
                <p className="text-[#7F8990] mb-4">
                  Official Betting Partner of the Ultimate Fighting Championship.
                </p>
                <p className="text-[#7F8990] text-sm">
                  Our partnership with UFC brings exclusive promotions, VIP experiences, and special 
                  offers during major fight events.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-40 bg-[#172B3A] rounded-md flex items-center justify-center mb-4">
                  <SiFcbarcelona className="text-[#1375e1] h-20 w-20" />
                </div>
                <h3 className="text-lg font-semibold mb-2">FC Barcelona</h3>
                <p className="text-[#7F8990] mb-4">
                  Global Partner of one of the world's most iconic football clubs.
                </p>
                <p className="text-[#7F8990] text-sm">
                  Our partnership with Barça includes jersey sponsorship and exclusive content with 
                  the team's biggest stars.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-40 bg-[#172B3A] rounded-md flex items-center justify-center mb-4">
                  <SiFormula1 className="text-[#1375e1] h-20 w-20" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Formula 1</h3>
                <p className="text-[#7F8990] mb-4">
                  Official Partner of Formula 1 racing events worldwide.
                </p>
                <p className="text-[#7F8990] text-sm">
                  Experience the thrill of F1 with our trackside presence and exclusive race weekend promotions.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-6">Why We Sponsor</h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Star className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Shared Values</h3>
                <p className="text-[#7F8990] text-sm">
                  We partner with organizations that share our commitment to excellence, innovation, and fair play.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Global Community</h3>
                <p className="text-[#7F8990] text-sm">
                  Our sponsorships connect us with millions of passionate fans around the world.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Award className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Elite Performance</h3>
                <p className="text-[#7F8990] text-sm">
                  We celebrate and support athletes and teams that push boundaries and achieve greatness.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#0F212E] border border-[#243442] rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Interested in a Partnership?</h3>
            <p className="text-[#7F8990] mb-6 max-w-2xl mx-auto">
              If you represent a sports team, athlete, or organization and are interested in exploring 
              sponsorship opportunities with Stake.com, we'd love to hear from you.
            </p>
            <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
              Contact Our Partnerships Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}