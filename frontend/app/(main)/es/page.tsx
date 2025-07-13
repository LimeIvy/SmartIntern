'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PlusIcon, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { v4 as uuidv4 } from 'uuid'


// --- Mock Data and Types ---
// NOTE: These types are simplified and do not include all fields from Prisma schema.
type Story = {
  id: string
  title: string
  situation: string
  task: string
  action: string
  result: string
  learned?: string | null
}

type EsStock = {
  id: string
  title: string
  content: string
  baseStoryId?: string | null
  baseStory?: {
    title: string
  } | null
}

const mockStories: Story[] = [
  {
    id: 'story-1',
    title: '大学祭実行委員でのリーダー経験',
    situation: '大学2年生の時、100人規模の大学祭実行委員会で企画局のリーダーを務めた。',
    task: '前年まで参加者アンケートの満足度が低迷しており、企画の魅力を向上させる必要があった。',
    action: 'メンバーと協力し、SNSを活用した参加型企画を立案・実行。準備段階で週に一度の進捗共有会を設け、タスクの可視化と円滑な連携を図った。',
    result: '結果として、大学祭の来場者数は前年比20%増となり、アンケートの満足度も5段階評価で平均4.5を獲得した。',
    learned: '多様な意見をまとめ、目標達成に向けてチームを導く調整力とリーダーシップを学んだ。',
  },
]

const mockEsStocks: EsStock[] = [
  {
    id: 'es-1',
    title: '自己PR（リーダーシップ）',
    content: '私の強みは、目標達成のために周囲を巻き込みながら行動できるリーダーシップです。大学祭実行委員会では企画局リーダーとして、低迷していた企画の満足度向上という課題に取り組みました。SNSでの参加型企画を提案し、チーム一丸となって実行した結果、来場者数を20%増加させ、高い評価を得ることができました。この経験で培ったリーダーシップを活かし、貴社でもチームに貢献したいと考えております。',
    baseStoryId: 'story-1',
    baseStory: { title: '大学祭実行委員でのリーダー経験' },
  },
]
// --- End of Mock Data ---


const storySchema = z.object({
  title: z.string().min(1, 'タイトルは必須です。'),
  situation: z.string().min(1, '状況は必須です。'),
  task: z.string().min(1, '課題・目標は必須です。'),
  action: z.string().min(1, '行動は必須です。'),
  result: z.string().min(1, '結果は必須です。'),
  learned: z.string().optional(),
})
type StoryFormValues = z.infer<typeof storySchema>

const esStockSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です。'),
  content: z.string().min(1, '内容は必須です。'),
  baseStoryId: z.string().optional().nullable(),
})
type EsStockFormValues = z.infer<typeof esStockSchema>

const LoadingSkeleton = () => (
  <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </CardFooter>
      </Card>
    ))}
  </div>
)

const StorySection = ({
  stories,
  setStories,
}: {
  stories: Story[]
  setStories: React.Dispatch<React.SetStateAction<Story[]>>
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      situation: '',
      task: '',
      action: '',
      result: '',
      learned: '',
    },
  })

  const openModal = (story: Story | null = null) => {
    setSelectedStory(story)
    if (story) {
      form.reset({
        ...story,
        learned: story.learned || '',
      })
    } else {
      form.reset({
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
        learned: '',
      })
    }
    setIsModalOpen(true)
  }

  const onSubmit = async (data: StoryFormValues) => {
    if (selectedStory) {
      // Edit
      setStories(stories.map(s => s.id === selectedStory.id ? { ...selectedStory, ...data } : s))
      toast.success('ストーリーを更新しました。')
    } else {
      // Add
      const newStory = { ...data, id: uuidv4() }
      setStories([newStory, ...stories])
      toast.success('ストーリーを追加しました。')
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当にこのストーリーを削除しますか？')) return
    setStories(stories.filter(s => s.id !== id))
    toast.success('ストーリーを削除しました。')
  }

  return (
    <div className="mt-4">
      <Button onClick={() => openModal()}>
        <PlusIcon className="mr-2 h-4 w-4" />
        新規ストーリーを追加
      </Button>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <Card key={story.id}>
            <CardHeader>
              <CardTitle>{story.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {story.action}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal(story)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(story.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStory ? 'ストーリーを編集' : '新規ストーリーを追加'}
            </DialogTitle>
            <DialogDescription>
              STARメソッドを意識して、あなたの経験を整理しましょう。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例：大学祭実行委員でのリーダー経験"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(S) 状況・背景</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="task"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(T) 課題・目標</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(A) 行動</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(R) 結果</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="learned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>この経験からの学び</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    キャンセル
                  </Button>
                </DialogClose>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const EsStockSection = ({
  esStocks,
  stories,
  setEsStocks
}: {
  esStocks: EsStock[]
  stories: Story[]
  setEsStocks: React.Dispatch<React.SetStateAction<EsStock[]>>
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEsStock, setSelectedEsStock] = useState<EsStock | null>(null)

  const form = useForm<EsStockFormValues>({
    resolver: zodResolver(esStockSchema),
    defaultValues: {
      title: '',
      content: '',
      baseStoryId: null,
    },
  })

  const openModal = (esStock: EsStock | null = null) => {
    setSelectedEsStock(esStock)
    if (esStock) {
      form.reset({
        ...esStock,
        baseStoryId: esStock.baseStoryId || null,
      })
    } else {
      form.reset({
        title: '',
        content: '',
        baseStoryId: null,
      })
    }
    setIsModalOpen(true)
  }

  const onSubmit = async (data: EsStockFormValues) => {
    const baseStory = stories.find(s => s.id === data.baseStoryId)

    if (selectedEsStock) {
      // Edit
      setEsStocks(esStocks.map(es => es.id === selectedEsStock.id ? { ...selectedEsStock, ...data, baseStory } : es))
      toast.success('ESストックを更新しました。')
    } else {
      // Add
      const newEsStock = { ...data, id: uuidv4(), baseStory }
      setEsStocks([newEsStock, ...esStocks])
      toast.success('ESストックを追加しました。')
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当にこのESストックを削除しますか？')) return
    setEsStocks(esStocks.filter(es => es.id !== id))
    toast.success('ESストックを削除しました。')
  }
  return (
    <div className="mt-4">
      <Button onClick={() => openModal()}>
        <PlusIcon className="mr-2 h-4 w-4" />
        新規ESストックを追加
      </Button>

      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
        {esStocks.map((esStock) => (
          <Card key={esStock.id}>
            <CardHeader>
              <CardTitle>{esStock.title}</CardTitle>
              {esStock.baseStory && (
                <CardDescription>
                  元ストーリー: {esStock.baseStory.title}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {esStock.content}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal(esStock)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(esStock.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEsStock ? 'ESストックを編集' : '新規ESストックを追加'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="例：自己PR（リーダーシップ）" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseStoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>元になるストーリー（任意）</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ストーリーを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">選択しない</SelectItem>
                        {stories.map((story) => (
                          <SelectItem key={story.id} value={story.id}>
                            {story.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[200px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    キャンセル
                  </Button>
                </DialogClose>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const EsPage = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [esStocks, setEsStocks] = useState<EsStock[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setStories(mockStories)
      setEsStocks(mockEsStocks)
      setIsLoading(false)
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ES管理</h1>
        <p className="text-muted-foreground">
          自己分析の「ストーリー」と、提出用の「ESストック」を一元管理します。
        </p>
      </header>
      <Tabs defaultValue="stories">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stories">自分のストーリー</TabsTrigger>
          <TabsTrigger value="es-stocks">ESストック</TabsTrigger>
        </TabsList>
        <TabsContent value="stories">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <StorySection stories={stories} setStories={setStories} />
          )}
        </TabsContent>
        <TabsContent value="es-stocks">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <EsStockSection
              esStocks={esStocks}
              stories={stories}
              setEsStocks={setEsStocks}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EsPage
