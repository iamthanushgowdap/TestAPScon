import AppLayout from '@/components/app-layout';
import TaskList from '@/components/task-list';

export default function TasksPage() {
  return (
    <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Task Manager</h1>
            <p className="text-muted-foreground mt-2">A simple checklist to keep you on track. Add, complete, and manage your tasks.</p>
            <div className="mt-8 max-w-2xl mx-auto">
                <TaskList />
            </div>
        </div>
    </AppLayout>
  );
}
