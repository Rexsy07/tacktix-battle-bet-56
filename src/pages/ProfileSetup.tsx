
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Gamepad2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileSetup = () => {
  const { toast } = useToast();
  const [codmId, setCodmId] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!codmId) {
      toast({
        title: "Error",
        description: "Please enter your CoD Mobile ID.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate profile setup
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile Setup Complete!",
        description: "Your TacktixEdge account is ready to use.",
        variant: "default",
      });
      // Would redirect to dashboard in real app
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Set Up Your <span className="text-gradient">Profile</span></h1>
            <p className="text-gray-400">Complete your profile to start earning</p>
          </div>

          <div className="glass-card rounded-xl p-6 mb-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-tacktix-blue">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Preview" />
                    ) : (
                      <AvatarFallback className="bg-tacktix-dark-light text-white text-xl">
                        TT
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <label htmlFor="avatar" className="cursor-pointer inline-flex items-center justify-center space-x-2 text-sm text-tacktix-blue hover:underline">
                    <Upload size={14} />
                    <span>{avatar ? "Change Avatar" : "Upload Avatar"}</span>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="codmId" className="flex items-center text-sm font-medium text-gray-300">
                    <Gamepad2 size={16} className="mr-2 text-tacktix-blue" />
                    CoD Mobile ID
                  </label>
                  <Input
                    id="codmId"
                    type="text"
                    placeholder="Enter your CoD Mobile ID"
                    className="bg-tacktix-dark-light text-white border-tacktix-dark-light focus:border-tacktix-blue"
                    value={codmId}
                    onChange={(e) => setCodmId(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">
                    Your CoD Mobile ID is required to verify match results
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm font-medium text-gray-300">
                    <CreditCard size={16} className="mr-2 text-tacktix-blue" />
                    Preferred Payment Method
                  </div>
                  
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 gap-2"
                  >
                    <div>
                      <RadioGroupItem
                        value="bank"
                        id="bank"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="bank"
                        className="flex items-center px-3 py-2 bg-tacktix-dark-light border border-tacktix-dark-light rounded-md cursor-pointer hover:bg-tacktix-dark-light/80 peer-data-[state=checked]:border-tacktix-blue peer-data-[state=checked]:bg-tacktix-blue/10"
                      >
                        <span className="text-sm">Bank Transfer</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="paypal"
                        id="paypal"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="paypal"
                        className="flex items-center px-3 py-2 bg-tacktix-dark-light border border-tacktix-dark-light rounded-md cursor-pointer hover:bg-tacktix-dark-light/80 peer-data-[state=checked]:border-tacktix-blue peer-data-[state=checked]:bg-tacktix-blue/10"
                      >
                        <span className="text-sm">PayPal</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="crypto"
                        id="crypto"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="crypto"
                        className="flex items-center px-3 py-2 bg-tacktix-dark-light border border-tacktix-dark-light rounded-md cursor-pointer hover:bg-tacktix-dark-light/80 peer-data-[state=checked]:border-tacktix-blue peer-data-[state=checked]:bg-tacktix-blue/10"
                      >
                        <span className="text-sm">Cryptocurrency</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="gradient" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Setting Up Profile..." : "Complete Profile Setup"}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-tacktix-dark-deeper px-2 text-gray-400">Your wallet will be automatically generated</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-tacktix-blue/10 border border-tacktix-blue/20 rounded-md">
                <p className="text-xs text-center text-gray-300">
                  A Naira (₦) wallet will be created for you. You'll be able to deposit funds and start betting once your profile is complete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
