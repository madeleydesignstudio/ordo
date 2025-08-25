// Email template helper utilities

/**
 * Generates dynamic email subjects based on template type and context
 */
export function getEmailSubject(
  template: string,
  context: Record<string, any> = {}
): string {
  const subjects: Record<string, string> = {
    welcome: `Welcome to Ordo, ${context.name || 'there'}!`,
    'password-reset': 'Reset your Ordo password',
    'email-verification': 'Verify your Ordo email address',
    'task-reminder': `Reminder: ${context.taskTitle || 'Task due soon'}`,
    'project-invitation': `You've been invited to ${context.projectName || 'a project'}`,
    'team-invitation': `Join ${context.teamName || 'our team'} on Ordo`,
    'task-assigned': `New task assigned: ${context.taskTitle || 'Task'}`,
    'task-completed': `Task completed: ${context.taskTitle || 'Task'}`,
    'project-update': `Update from ${context.projectName || 'project'}`,
    'weekly-digest': `Your Ordo Weekly Digest - ${formatEmailDate(new Date())}`,
    'account-deletion': 'Your Ordo account has been deleted',
    'subscription-renewal': 'Ordo subscription renewal reminder',
    'payment-failed': 'Ordo payment failed - Action required',
    'downgrade-warning': 'Ordo plan downgrade scheduled',
  };

  return subjects[template] || `Ordo Notification`;
}

/**
 * Formats dates for email display
 */
export function formatEmailDate(
  date: Date,
  options: {
    includeTime?: boolean;
    timeZone?: string;
    format?: 'short' | 'medium' | 'long' | 'full';
  } = {}
): string {
  const {
    includeTime = false,
    timeZone = 'UTC',
    format = 'medium'
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    ...(format === 'short' && {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    ...(format === 'medium' && {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    ...(format === 'long' && {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    ...(format === 'full' && {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    ...(includeTime && {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

/**
 * Truncates text for email previews and summaries
 */
export function truncateText(
  text: string,
  maxLength: number = 150,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to cut at a word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.slice(0, lastSpaceIndex) + ellipsis;
  }

  return truncated + ellipsis;
}

/**
 * Converts plain text to HTML with basic formatting
 */
export function textToHtml(text: string): string {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

/**
 * Strips HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Generates unsubscribe URL with token
 */
export function generateUnsubscribeUrl(
  baseUrl: string,
  userId: string,
  emailType: string
): string {
  const params = new URLSearchParams({
    user: userId,
    type: emailType,
    // In a real implementation, you'd generate a secure token
    token: Buffer.from(`${userId}:${emailType}:${Date.now()}`).toString('base64url'),
  });

  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

/**
 * Creates email-safe color values
 */
export function getEmailColors() {
  return {
    primary: '#000000',
    secondary: '#666666',
    accent: '#0070f3',
    success: '#00d084',
    warning: '#f5a623',
    error: '#e00',
    background: '#ffffff',
    muted: '#f8f9fa',
    border: '#e1e8ed',
    text: '#333333',
    textMuted: '#666666',
    link: '#0070f3',
  };
}

/**
 * Formats currency for email display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Creates a greeting based on time of day
 */
export function getTimeBasedGreeting(
  name?: string,
  timeZone: string = 'UTC'
): string {
  const hour = new Date().toLocaleString('en-US', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  });

  const hourNum = parseInt(hour);
  let greeting = '';

  if (hourNum < 12) {
    greeting = 'Good morning';
  } else if (hourNum < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  return name ? `${greeting}, ${name}` : greeting;
}

/**
 * Generates email tracking pixel URL (if needed for analytics)
 */
export function generateTrackingPixelUrl(
  baseUrl: string,
  emailId: string,
  userId: string
): string {
  const params = new URLSearchParams({
    e: emailId,
    u: userId,
    t: Date.now().toString(),
  });

  return `${baseUrl}/track/open.gif?${params.toString()}`;
}

/**
 * Creates email-safe inline CSS styles
 */
export function createInlineStyles(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
}

/**
 * Formats a list for email display
 */
export function formatEmailList(
  items: string[],
  maxItems: number = 5,
  moreText: string = 'and {count} more'
): string {
  if (items.length <= maxItems) {
    return items.join(', ');
  }

  const displayed = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  return `${displayed.join(', ')}, ${moreText.replace('{count}', remaining.toString())}`;
}
