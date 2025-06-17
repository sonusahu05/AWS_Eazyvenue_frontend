import { Component } from '@angular/core';

declare var Razorpay: any;

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  leads: string;
  totalLeads: string;
  features: string[];
  popular?: boolean;
  color: string;
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 6000000,
      duration: '3 Months',
      leads: '100',
      totalLeads: '100',
      features: [
        '100 Filtered Leads',
        '3 Months Validity',
        'Email Support',
        'Basic Analytics'
      ],
      color: 'orange'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 12000000,
      duration: '6 Months',
      leads: '100 + 100',
      totalLeads: '200',
      features: [
        '100 Premium Leads',
        '100 Standard Leads',
        '6 Months Validity',
        'Priority Support',
        'Advanced Analytics',
        'Lead Verification'
      ],
      popular: true,
      color: 'red'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 20000000,
      duration: '12 Months',
      leads: '500',
      totalLeads: '500',
      features: [
        '400 Premium Leads Monthly',
        '100 Standard Leads Monthly',
        '12 Months Validity',
        '24/7 Dedicated Support',
        'Custom Analytics Dashboard',
        'API Access',
        'Lead Verification',
        'Custom Integration'
      ],
      color: 'blue'
    }
  ];

  constructor() {
    // Load Razorpay script dynamically
    this.loadRazorpayScript();
  }

  private loadRazorpayScript(): void {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.initiatePayment(plan);
  }

  private initiatePayment(plan: SubscriptionPlan): void {
    const options = {
      key: 'rzp_live_oyCHow0OxfS8oL',
      amount: plan.price,
      currency: 'INR',
      name: 'EazyVenue.com',
      description: `${plan.name} - Lead Generation for Banquet Owners`,
      image: '/assets/images/logo.png',
      order_id: '',
      handler: (response: any) => {
        this.handlePaymentSuccess(response, plan);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        duration: plan.duration
      },
      theme: {
        color: this.getThemeColor(plan.color)
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
        }
      }
    };

    if (typeof Razorpay !== 'undefined') {
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      console.error('Razorpay SDK not loaded');
      alert('Payment system is currently unavailable. Please try again later.');
    }
  }

  private handlePaymentSuccess(response: any, plan: SubscriptionPlan): void {
    console.log('Payment successful:', response);

    // Here you would typically:
    // 1. Verify the payment on your backend
    // 2. Activate the subscription
    // 3. Redirect to success page or show success message

    alert(`Payment successful! Your ${plan.name} has been activated.`);

    // Example: Redirect to dashboard or success page
    // this.router.navigate(['/dashboard']);
  }

  private getThemeColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'orange': '#FF6B35',
      'red': '#E74C3C',
      'blue': '#3498DB'
    };
    return colorMap[color] || '#FF6B35';
  }

  formatPrice(price: number): string {
    return (price / 100).toLocaleString('en-IN');
  }
}