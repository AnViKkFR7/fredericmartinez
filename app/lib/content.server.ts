import { supabase, isConfigured } from '~/lib/supabase.server'
import { COMPANY_ID } from '~/lib/company'
import type { AttributeMap, ProjectCase, ProjectStat, RawAttributeValue, RawItem, TrayectoriaSlide, WebSection, WebService } from '~/types'

const ATTR_SELECT = `
  value_text,
  value_number,
  value_boolean,
  value_date,
  value_json,
  value_text_array,
  value_number_array,
  attribute_definitions ( key, data_type )
`

const MEDIA_SELECT = `
  id,
  item_id,
  file_type,
  url_externa,
  title,
  alt_text,
  sort_order,
  metadata,
  created_at
`

function mapAttrs(values: RawAttributeValue[]): AttributeMap {
  const map: AttributeMap = {}
  for (const av of values) {
    const def = av.attribute_definitions
    if (!def) continue
    switch (def.data_type) {
      case 'text':
        map[def.key] = av.value_text
        break
      case 'number':
        map[def.key] = av.value_number
        break
      case 'boolean':
        map[def.key] = av.value_boolean
        break
      case 'date':
        map[def.key] = av.value_date
        break
      case 'json':
        map[def.key] = av.value_json
        break
      case 'text_array':
        map[def.key] = av.value_text_array
        break
      case 'number_array':
        map[def.key] = av.value_number_array
        break
    }
  }
  return map
}

async function fetchItems(itemType: string): Promise<RawItem[]> {
  if (!isConfigured) return []

  const { data, error } = await supabase
    .from('items')
    .select(`id, title, summary, status, item_type, attribute_values ( ${ATTR_SELECT} ), item_media ( ${MEDIA_SELECT} )`)
    .eq('company_id', COMPANY_ID)
    .eq('item_type', itemType)
    .eq('status', 'published')

  if (error || !data) return []
  return data as unknown as RawItem[]
}

export async function getWebSection(sectionKey: string): Promise<WebSection | null> {
  const items = await fetchItems('web_section')
  const item = items.find((i) => {
    const attrs = mapAttrs(i.attribute_values)
    return attrs['section_key'] === sectionKey
  })
  if (!item) return null
  return { id: item.id, title: item.title, attrs: mapAttrs(item.attribute_values)}
}

export async function getTrayectoriaSlide(): Promise<TrayectoriaSlide[]> {
  const items = await fetchItems('trajectoria_cards')
  return items
    .map((item) => {
      const attrs = mapAttrs(item.attribute_values)
      return {
        id: item.id,
        category: (attrs['category'] as string) ?? '',
        years: (attrs['years'] as string) ?? '',
        title: (attrs['title'] as string) ?? '',
        institution: (attrs['institution'] as string) ?? '',
        color: (attrs['color'] as "dark" | "blue") ?? 'dark',
        order: (attrs['order'] as string) ?? '0',
      }
    })
    .sort((a, b) => {
      const orderA = (mapAttrs(items.find(i => i.id === a.id)?.attribute_values ?? [])['order'] as string) ?? '0'
      const orderB = (mapAttrs(items.find(i => i.id === b.id)?.attribute_values ?? [])['order'] as string) ?? '0'
      return parseInt(orderA) - parseInt(orderB)
    })
}

function mapProjectStats(attrs: AttributeMap): ProjectStat[] {
  const nums = (attrs['tarjetas_laterales'] as string[]) ?? []
  const labels = (attrs['tarjetas_laterales_label'] as string[]) ?? []
  if (nums.length > 0) {
    return nums.map((num, i) => ({ num, label: labels[i] ?? '' }))
  }
  return (attrs['stats'] as ProjectStat[]) ?? []
}

function mapProjectCase(item: RawItem): ProjectCase {
  const attrs = mapAttrs(item.attribute_values)
  return {
    id: item.id,
    title: item.title,
    order: (attrs['project_order'] as number) ?? 0,
    client: (attrs['client'] as string) ?? '',
    description: (attrs['description'] as string) ?? item.summary ?? '',
    tags: (attrs['tags'] as string[]) ?? [],
    media: item.item_media ?? [],
    slug: (attrs['slug'] as string) ?? '',
    rol: (attrs['rol'] as string) ?? '',
    duracion: (attrs['duracion'] as string) ?? '',
    ambito: (attrs['ambito'] as string) ?? '',
    contexto: (attrs['contexto'] as string) ?? '',
    reto: (attrs['reto'] as string) ?? '',
    queHice: (attrs['que_hice'] as string[]) ?? [],
    resultados: (attrs['resultados'] as string[]) ?? [],
    stats: mapProjectStats(attrs),
  }
}

function mapWebService(item: RawItem): WebService {
  const attrs = mapAttrs(item.attribute_values)
  return {
    id: item.id,
    title: item.title,
    order: (attrs['service_order'] as number) ?? 0,
    description: (attrs['description'] as string) ?? item.summary ?? '',
    que_se_hacer: (attrs['que_se_hacer'] as string[]) ?? [],
    media: item.item_media ?? [],
    paraQuien: (attrs['para_quien'] as string[]) ?? [],
    incluye: (attrs['incluye'] as string[]) ?? [],
    relatedProjectSlugs: (attrs['related_project_slugs'] as string[]) ?? [],
  }
}

export async function getProjectCases(): Promise<ProjectCase[]> {
  const items = await fetchItems('web_project_case')
  return items.map(mapProjectCase).sort((a, b) => a.order - b.order)
}

export async function getProjectCaseById(id: string): Promise<ProjectCase | null> {
  const items = await fetchItems('web_project_case')
  const item = items.find((i) => i.id === id)
  return item ? mapProjectCase(item) : null
}

export async function getWebServices(): Promise<WebService[]> {
  const items = await fetchItems('web_service')
  return items.map(mapWebService).sort((a, b) => a.order - b.order)
}

export async function getServiceById(id: string): Promise<WebService | null> {
  const items = await fetchItems('web_service')
  const item = items.find((i) => i.id === id)
  return item ? mapWebService(item) : null
}

export async function getRelatedProjects(slugs: string[]): Promise<ProjectCase[]> {
  if (slugs.length === 0) return []
  const projects = await getProjectCases()
  return slugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is ProjectCase => Boolean(p))
}

