import { useState } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started with AI course generation",
        icon: Zap,
        gradient: "from-gray-400 to-gray-500",
        features: [
            "Generate up to 5 courses",
            "Basic AI content generation",
            "YouTube video integration",
            "Community support",
            "Standard quality content",
        ],
        limitations: [
            "Limited to 5 courses",
            "No priority support",
        ],
        buttonText: "Current Plan",
        current: true,
    },
    {
        name: "Pro",
        price: "$9.99",
        period: "/month",
        description: "For creators who want unlimited courses and premium features",
        icon: Sparkles,
        gradient: "from-violet-500 to-purple-600",
        popular: true,
        features: [
            "Unlimited course generation",
            "Advanced AI content quality",
            "YouTube video integration",
            "Priority email support",
            "Export courses as PDF",
            "Custom course branding",
            "Analytics dashboard",
        ],
        limitations: [],
        buttonText: "Upgrade to Pro",
        current: false,
    },
    {
        name: "Enterprise",
        price: "$29.99",
        period: "/month",
        description: "For teams and organizations that need advanced collaboration",
        icon: Crown,
        gradient: "from-amber-500 to-orange-600",
        features: [
            "Everything in Pro",
            "Team collaboration (up to 10 members)",
            "API access",
            "Custom AI model fine-tuning",
            "White-label courses",
            "Dedicated account manager",
            "SSO & advanced security",
            "SLA guarantee",
        ],
        limitations: [],
        buttonText: "Contact Sales",
        current: false,
    },
];

const UpgradePage = () => {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade Your Plan</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Get unlimited AI-powered course generation with premium features
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                    <button
                        onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
                        className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${billing === "yearly" ? "bg-primary" : "bg-border"}`}
                    >
                        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${billing === "yearly" ? "translate-x-5.5 left-0.5" : "left-0.5"}`}
                            style={{ transform: billing === "yearly" ? "translateX(20px)" : "translateX(0)" }}
                        />
                    </button>
                    <span className={`text-sm font-medium ${billing === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                        Yearly
                        <span className="ml-1 text-xs text-green-500 font-semibold">Save 20%</span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan) => {
                    const PlanIcon = plan.icon;
                    const displayPrice = billing === "yearly" && !plan.current
                        ? `$${(parseFloat(plan.price.replace("$", "")) * 0.8).toFixed(2)}`
                        : plan.price;

                    return (
                        <div
                            key={plan.name}
                            className={`relative bg-card border rounded-2xl p-6 flex flex-col ${plan.popular
                                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                                    : "border-border"
                                }`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                                <PlanIcon className="h-6 w-6 text-white" />
                            </div>

                            {/* Plan name & price */}
                            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2 mb-1">
                                <span className="text-3xl font-bold text-foreground">{displayPrice}</span>
                                <span className="text-sm text-muted-foreground">{plan.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                            {/* Features */}
                            <div className="flex-1 space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-foreground">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                disabled={plan.current}
                                className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${plan.current
                                        ? "bg-secondary text-muted-foreground cursor-default"
                                        : plan.popular
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "border border-border text-foreground hover:bg-secondary"
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* FAQ / Trust indicators */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                    All plans include a 7-day free trial. Cancel anytime. No hidden fees.
                </p>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                    <span>🔒 Secure Payment</span>
                    <span>📧 24/7 Support</span>
                    <span>💯 Money-back Guarantee</span>
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;
