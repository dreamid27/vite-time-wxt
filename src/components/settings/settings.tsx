import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Moon,
  Sun,
  Monitor,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  customRedirectionUrl: z.string().url('Please enter a valid URL'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function Settings() {
  const { theme, setTheme } = useTheme();
  const {
    settings,
    isLoading,
    error,
    loadSettings,
    updateTheme,
    updateCustomRedirectionUrl,
    resetSettings,
  } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'system',
      customRedirectionUrl:
        'https://www.goodreads.com/quotes/tag/positive-affirmations',
    },
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        theme: settings.theme,
        customRedirectionUrl: settings.customRedirectionUrl,
      });
    }
  }, [settings, form]);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      // Update theme immediately for better UX
      setTheme(newTheme);
      // Then persist to database
      await updateTheme(newTheme);
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
      // Revert theme change on error
      if (settings) {
        setTheme(settings.theme);
      }
    }
  };

  const handleUrlSubmit = async (data: SettingsFormData) => {
    try {
      setIsSubmitting(true);
      await updateCustomRedirectionUrl(data.customRedirectionUrl);
      toast.success('Redirection URL updated successfully');
    } catch (error) {
      toast.error('Failed to update redirection URL');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      setTheme('system');
      toast.success('Settings reset to defaults');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  const testRedirectionUrl = () => {
    const url = form.getValues('customRedirectionUrl');
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading settings</p>
          <Button onClick={loadSettings} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the extension looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme or use system setting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Redirection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Redirection Settings
          </CardTitle>
          <CardDescription>
            Configure where blocked sites redirect to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUrlSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="customRedirectionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Redirection URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={testRedirectionUrl}
                        className="shrink-0"
                      >
                        Test
                      </Button>
                    </div>
                    <FormDescription>
                      When a blocked site is accessed, users will be redirected
                      to this URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset Settings
          </CardTitle>
          <CardDescription>
            Reset all settings to their default values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
