import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function BugReportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Report Bug</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Bug or Suggest an Improvement</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input placeholder="Email (optional)" />
          <Textarea placeholder="Describe the issue or suggestion" />
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 