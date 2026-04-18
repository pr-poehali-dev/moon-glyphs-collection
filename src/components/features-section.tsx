import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Стихи с душой",
    description: "Авторские тексты, написанные от первого лица — с эмоцией, образами и глубиной, которые не оставят равнодушным.",
    icon: "brain",
    badge: "Поэзия",
  },
  {
    title: "Музыка от ИИ",
    description: "Уникальные мелодии, созданные нейросетью специально под каждое стихотворение — звук как продолжение слова.",
    icon: "zap",
    badge: "AI-звук",
  },
  {
    title: "Живое слияние",
    description: "Стихи и музыка звучат вместе — создавая единое произведение, где каждая строка обретает голос.",
    icon: "link",
    badge: "Синтез",
  },
  {
    title: "Уникальный стиль",
    description: "Авторский голос, не похожий ни на кого — на пересечении лирики, электроники и человеческого переживания.",
    icon: "target",
    badge: "Авторство",
  },
  {
    title: "Новый опыт",
    description: "Слушатель получает не просто трек или стихотворение, а полноценное аудиовизуальное переживание.",
    icon: "globe",
    badge: "Опыт",
  },
  {
    title: "Создано человеком",
    description: "За каждым треком — живой автор, его история и чувства. ИИ — инструмент, но не замена душе.",
    icon: "lock",
    badge: "Человек",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Там, где слово встречает звук</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Поэзия и музыка, созданные на стыке человеческого творчества и искусственного интеллекта
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">
                    {feature.icon === "brain" && "&#129504;"}
                    {feature.icon === "lock" && "&#128274;"}
                    {feature.icon === "globe" && "&#127760;"}
                    {feature.icon === "zap" && "&#9889;"}
                    {feature.icon === "link" && "&#128279;"}
                    {feature.icon === "target" && "&#127919;"}
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}