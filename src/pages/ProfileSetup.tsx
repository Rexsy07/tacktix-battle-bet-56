
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Upload, User, Wallet } from "lucide-react";

const ProfileSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [codmId, setCodmId] = useState("");
  const [username, setUsername] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (activeStep === 1 && !codmId) {
      toast({
        title: "Required Field",
        description: "Please enter your Call of Duty Mobile ID",
        variant: "destructive",
      });
      return;
    }

    if (activeStep === 3) {
      setIsLoading(true);
      // Simulate account creation
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Profile Created!",
          description: "Your TacktixEdge account is ready to go.",
          variant: "default",
        });
        navigate("/wallet");
      }, 1500);
      return;
    }

    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codm-id">Call of Duty Mobile ID</Label>
              <Input
                id="codm-id"
                placeholder="Enter your CoDM ID"
                value={codmId}
                onChange={(e) => setCodmId(e.target.value)}
                className="bg-tacktix-dark-light"
              />
              <p className="text-sm text-gray-400">
                This ID will be used to verify your identity during matches
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Display Username (Optional)</Label>
              <Input
                id="username"
                placeholder="Choose a display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-tacktix-dark-light"
              />
              <p className="text-sm text-gray-400">
                This is how other players will see you on TacktixEdge
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-tacktix-dark-light text-lg">
                  {username ? username[0].toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center">
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer flex items-center space-x-2 text-tacktix-blue hover:underline"
                >
                  <Upload size={16} />
                  <span>Upload Profile Picture</span>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG or GIF - Max size 2MB
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-tacktix-blue/10 rounded-lg border border-tacktix-blue/20">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-tacktix-blue/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-tacktix-blue" />
                </div>
                <div>
                  <h3 className="font-medium">Naira Wallet</h3>
                  <p className="text-sm text-gray-400">
                    Your account comes with a Naira wallet for betting and receiving winnings
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Select Default Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`flex items-center space-x-2 border ${paymentMethod === 'bank' ? 'border-tacktix-blue bg-tacktix-blue/5' : 'border-white/10'} rounded-lg p-3 cursor-pointer`}
                       onClick={() => setPaymentMethod('bank')}>
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="cursor-pointer flex-1">Bank Transfer</Label>
                  </div>
                  <div className={`flex items-center space-x-2 border ${paymentMethod === 'card' ? 'border-tacktix-blue bg-tacktix-blue/5' : 'border-white/10'} rounded-lg p-3 cursor-pointer`}
                       onClick={() => setPaymentMethod('card')}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="cursor-pointer flex-1">Credit/Debit Card</Label>
                  </div>
                  <div className={`flex items-center space-x-2 border ${paymentMethod === 'ussd' ? 'border-tacktix-blue bg-tacktix-blue/5' : 'border-white/10'} rounded-lg p-3 cursor-pointer`}
                       onClick={() => setPaymentMethod('ussd')}>
                    <RadioGroupItem value="ussd" id="ussd" />
                    <Label htmlFor="ussd" className="cursor-pointer flex-1">USSD</Label>
                  </div>
                  <div className={`flex items-center space-x-2 border ${paymentMethod === 'digital' ? 'border-tacktix-blue bg-tacktix-blue/5' : 'border-white/10'} rounded-lg p-3 cursor-pointer`}
                       onClick={() => setPaymentMethod('digital')}>
                    <RadioGroupItem value="digital" id="digital" />
                    <Label htmlFor="digital" className="cursor-pointer flex-1">Digital Wallet</Label>
                  </div>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-400">
                You can change or add more payment methods later in your account settings
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12">
        <Card className="glass-card overflow-hidden border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your TacktixEdge account to start playing and earning
            </CardDescription>
          </CardHeader>
          
          <div className="px-6">
            <div className="relative flex justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center 
                    ${activeStep >= step 
                      ? 'bg-tacktix-blue text-white' 
                      : 'bg-tacktix-dark-light text-gray-400'}`}
                  >
                    {activeStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  <span 
                    className={`text-xs mt-2 hidden md:block 
                    ${activeStep >= step ? 'text-tacktix-blue' : 'text-gray-400'}`}
                  >
                    {step === 1 ? 'Game Info' : step === 2 ? 'Profile Picture' : 'Payment Setup'}
                  </span>
                </div>
              ))}
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-tacktix-dark-light">
                <div 
                  className="h-full bg-tacktix-blue transition-all" 
                  style={{ width: `${(activeStep - 1) * 50}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <CardContent>
            {getStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={activeStep === 1}
            >
              Back
            </Button>
            <Button
              variant="gradient"
              onClick={handleNextStep}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Creating Profile...
                </>
              ) : activeStep === 3 ? (
                'Complete Setup'
              ) : (
                'Continue'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
