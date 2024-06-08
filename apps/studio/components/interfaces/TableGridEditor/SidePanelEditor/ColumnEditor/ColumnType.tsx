import * as Tooltip from '@radix-ui/react-tooltip'
import { noop } from 'lodash'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import {
  Alert,
  Button,
  CommandEmpty_Shadcn_,
  CommandGroup_Shadcn_,
  CommandInput_Shadcn_,
  CommandItem_Shadcn_,
  CommandList_Shadcn_,
  Command_Shadcn_,
  Input,
  PopoverContent_Shadcn_,
  PopoverTrigger_Shadcn_,
  Popover_Shadcn_,
  ScrollArea,
  cn,
} from 'ui'

import type { EnumeratedType } from 'data/enumerated-types/enumerated-types-query'
import {
  Calendar,
  Check,
  ChevronsUpDown,
  ExternalLink,
  Hash,
  ListPlus,
  ToggleRight,
  Type,
} from 'lucide-react'
import {
  POSTGRES_DATA_TYPES,
  POSTGRES_DATA_TYPE_OPTIONS,
  RECOMMENDED_ALTERNATIVE_DATA_TYPE,
} from '../SidePanelEditor.constants'
import type { PostgresDataTypeOption } from '../SidePanelEditor.types'

interface ColumnTypeProps {
  value: string
  enumTypes: EnumeratedType[]
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge'
  layout?: 'vertical' | 'horizontal'
  className?: string
  error?: any
  disabled?: boolean
  showLabel?: boolean
  description?: ReactNode
  showRecommendation?: boolean
  onOptionSelect: (value: string) => void
}

const ColumnType = ({
  value,
  enumTypes = [],
  className,
  size = 'medium',
  layout,
  error,
  disabled = false,
  showLabel = true,
  description,
  showRecommendation = false,
  onOptionSelect = noop,
}: ColumnTypeProps) => {
  // @ts-ignore
  const availableTypes = POSTGRES_DATA_TYPES.concat(enumTypes.map((type) => type.name))
  const isAvailableType = value ? availableTypes.includes(value) : true
  const recommendation = RECOMMENDED_ALTERNATIVE_DATA_TYPE[value]
  const [open, setOpen] = useState(false)
  const [columnValue, setColumnValue] = useState('')

  const inferIcon = (type: string) => {
    console.log({ type })
    switch (type) {
      case 'number':
        return <Hash size={14} className="text-foreground" strokeWidth={1.5} />
      case 'time':
        return <Calendar size={14} className="text-foreground" strokeWidth={1.5} />
      case 'text':
        return <Type size={14} className="text-foreground" strokeWidth={1.5} />
      case 'json':
        return (
          <div className="text-foreground" style={{ padding: '0px 1px' }}>
            {'{ }'}
          </div>
        )
      case 'bool':
        return <ToggleRight size={14} className="text-foreground" strokeWidth={1.5} />
      default:
        return <ListPlus size={16} className="text-foreground" strokeWidth={1.5} />
    }
  }

  if (!isAvailableType) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger>
          <Input
            readOnly
            disabled
            label={showLabel ? 'Type' : ''}
            layout={showLabel ? 'horizontal' : undefined}
            className="md:gap-x-0"
            size="small"
            icon={inferIcon(POSTGRES_DATA_TYPE_OPTIONS.find((x) => x.name === value)?.type ?? '')}
            value={value}
            descriptionText={
              showLabel
                ? 'Custom non-native psql data types currently cannot be changed to a different data type via Supabase Studio'
                : ''
            }
          />
        </Tooltip.Trigger>
        {!showLabel && (
          <Tooltip.Portal>
            <Tooltip.Content side="bottom">
              <Tooltip.Arrow className="radix-tooltip-arrow" />
              <div
                className={[
                  'rounded bg-alternative py-1 px-2 leading-none shadow',
                  'border border-background w-[240px]',
                ].join(' ')}
              >
                <span className="text-xs text-foreground">
                  Custom non-native psql data types currently cannot be changed to a different data
                  type via Supabase Studio
                </span>
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    )
  }

  if (disabled && !showLabel) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger>
          <Input
            readOnly
            disabled
            label={showLabel ? 'Type' : ''}
            layout={showLabel ? 'horizontal' : undefined}
            className="md:gap-x-0"
            size="small"
            icon={inferIcon(POSTGRES_DATA_TYPE_OPTIONS.find((x) => x.name === value)?.type ?? '')}
            value={value}
          />
        </Tooltip.Trigger>
        {!showLabel && description && (
          <Tooltip.Portal>
            <Tooltip.Content side="bottom">
              <Tooltip.Arrow className="radix-tooltip-arrow" />
              <div
                className={[
                  'rounded bg-alternative py-1 px-2 leading-none shadow',
                  'border border-background w-[240px]',
                ].join(' ')}
              >
                <span className="text-xs text-foreground">{description}</span>
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    )
  }

  return (
    <div className="space-y-2">
      <Popover_Shadcn_ open={open} onOpenChange={setOpen}>
        <PopoverTrigger_Shadcn_ asChild>
          <Button
            type="default"
            role="combobox"
            size={'small'}
            aria-expanded={open}
            className="w-[250px] w-full justify-between"
            iconRight={<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          >
            {value ? (
              <div className="flex gap-2">
                <span>{inferIcon(availableTypes.find((type) => type === value) ?? '')}</span>
                {availableTypes.find((type) => type === value)}
              </div>
            ) : (
              'Choose a column type...'
            )}
          </Button>
        </PopoverTrigger_Shadcn_>
        <PopoverContent_Shadcn_ className="w-[460px] p-0" side="top" align="center">
          <ScrollArea className="h-[335px]">
            <Command_Shadcn_>
              <CommandInput_Shadcn_ placeholder="Search types..." />
              <CommandEmpty_Shadcn_>Type not found.</CommandEmpty_Shadcn_>

              <CommandList_Shadcn_>
                <CommandGroup_Shadcn_>
                  {POSTGRES_DATA_TYPE_OPTIONS.map((option: PostgresDataTypeOption) => (
                    <CommandItem_Shadcn_
                      key={option.name}
                      value={option.name}
                      className={cn('relative', option.name === value ? 'bg-surface-200' : '')}
                      onSelect={(value: string) => {
                        onOptionSelect(value)
                        setOpen(false)
                      }}
                      //addOnBefore={() => inferIcon(option.type)}
                    >
                      <div className="flex items-center gap-2 pr-6">
                        <span>{inferIcon(option.type)}</span>
                        <span className="text-foreground">{option.name}</span>
                        <span className="text-foreground-lighter">{option.description}</span>
                      </div>
                      <span className="absolute right-3 top-2">
                        {option.name === value ? (
                          <Check className="text-brand-500" size={14} />
                        ) : (
                          ''
                        )}
                      </span>
                    </CommandItem_Shadcn_>
                  ))}
                </CommandGroup_Shadcn_>
                {enumTypes.length > 0 && (
                  <>
                    <CommandItem_Shadcn_>Other types</CommandItem_Shadcn_>
                    <CommandGroup_Shadcn_>
                      {enumTypes.map((option: PostgresType) => (
                        <CommandItem_Shadcn_
                          key={option.name}
                          value={option.name}
                          className={cn('relative', option.name === value ? 'bg-surface-200' : '')}
                          onSelect={(value: string) => {
                            onOptionSelect(value)
                            setOpen(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <ListPlus size={16} className="text-foreground" strokeWidth={1.5} />
                            </div>
                            <span className="text-foreground">{option.name}</span>
                            {option.comment !== undefined && (
                              <span title={option.comment} className="text-foreground-lighter">
                                {option.comment}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              {option.name === value ? <Check size={13} /> : ''}
                            </span>
                          </div>
                        </CommandItem_Shadcn_>
                      ))}
                    </CommandGroup_Shadcn_>
                  </>
                )}
              </CommandList_Shadcn_>
            </Command_Shadcn_>
          </ScrollArea>
        </PopoverContent_Shadcn_>
      </Popover_Shadcn_>

      {showRecommendation && recommendation !== undefined && (
        <Alert
          withIcon
          variant="warning"
          title={
            <>
              It is recommended to use <code className="text-xs">{recommendation.alternative}</code>{' '}
              instead
            </>
          }
        >
          <p>
            Postgres recommends against using the data type <code className="text-xs">{value}</code>{' '}
            unless you have a very specific use case.
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Button asChild type="default" icon={<ExternalLink />}>
              <Link href={recommendation.reference} target="_blank" rel="noreferrer">
                Read more
              </Link>
            </Button>
            <Button type="primary" onClick={() => onOptionSelect(recommendation.alternative)}>
              Use {recommendation.alternative}
            </Button>
          </div>
        </Alert>
      )}
    </div>
  )
}

export default ColumnType
