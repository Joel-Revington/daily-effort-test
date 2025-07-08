
export const addDemoToSalesTracking = (demoEntry: any, user: any) => {
  // Extract company name from demo notes or use a default
  const companyName = extractCompanyNameFromNotes(demoEntry.notes) || `Demo Client - ${new Date().toLocaleDateString()}`;
  
  const newLead = {
    id: `demo-${Date.now()}`,
    companyName: companyName,
    contactPerson: 'TBD',
    email: '',
    phone: '',
    leadSource: 'Demo Report',
    assignedTo: user.name,
    status: 'demo-given',
    demoDate: new Date().toISOString().split('T')[0],
    demoNotes: demoEntry.notes,
    createdDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    notes: `Auto-generated from daily report demo entry. Demo conducted by ${user.name} on ${demoEntry.fromTime} - ${demoEntry.toTime}`
  };

  // Get existing leads from localStorage
  const existingLeads = JSON.parse(localStorage.getItem('salesLeads') || '[]');
  
  // Add new lead
  existingLeads.push(newLead);
  
  // Save back to localStorage
  localStorage.setItem('salesLeads', JSON.stringify(existingLeads));
  
  return newLead;
};

const extractCompanyNameFromNotes = (notes: string): string | null => {
  // Simple extraction logic - look for common patterns
  const patterns = [
    /for\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|\.)/i,
    /with\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|\.)/i,
    /at\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|\.)/i,
    /([A-Z][a-zA-Z\s&]{2,20})\s+(?:demo|presentation|training)/i
  ];
  
  for (const pattern of patterns) {
    const match = notes.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

export const addFollowUpTask = (leadData: any) => {
  if (!leadData.followUp || !leadData.followUpDate) return;

  const task = {
    id: `followup-${Date.now()}`,
    title: `Follow up with ${leadData.companyName}`,
    description: `Follow up on lead: ${leadData.contactPerson} from ${leadData.companyName}. Requirement: ${leadData.requirement}`,
    assignedTo: leadData.salesPerson,
    priority: 'Medium',
    status: 'To Do',
    dueDate: leadData.followUpDate,
    category: 'Sales Follow-up',
    createdBy: 'System',
    createdAt: new Date().toISOString()
  };

  // Get existing tasks from localStorage
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
  // Add new task
  existingTasks.push(task);
  
  // Save back to localStorage
  localStorage.setItem('tasks', JSON.stringify(existingTasks));
  
  return task;
};
