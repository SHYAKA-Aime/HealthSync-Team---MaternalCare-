export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  export const calculateAge = (dob: string): { years?: number; months?: number } => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return { years };
    } else {
      return { months };
    }
  };
  
  export const calculatePregnancyWeek = (expectedDelivery: string): number => {
    const dueDate = new Date(expectedDelivery);
    const today = new Date();
    const daysRemaining = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = 40 - Math.floor(daysRemaining / 7);
    return Math.max(0, Math.min(40, weeksPregnant));
  };
  
  export const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith('+250')) {
      return phone;
    } else if (phone.startsWith('250')) {
      return '+' + phone;
    } else if (phone.startsWith('0')) {
      return '+250' + phone.substring(1);
    }
    return phone;
  };
  
  