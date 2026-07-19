const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['节点名称', '🟢 自动-测速'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
  if (['JP', 'JP-auto', '🇯🇵 JP', '🇯🇵 JP-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /日本|jp|japan|🇯🇵/i))
  }
  if (['US', 'US-auto', '🇺🇸 US', '🇺🇸 US-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /美|us|unitedstates|united states|🇺🇸/i))
  }
  if (['self', 'self-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*免费).+/i))
  }
})

const selfAutoOutbound = config.outbounds.find(i => i.tag === 'self-auto')
if (selfAutoOutbound && Array.isArray(selfAutoOutbound.outbounds) && selfAutoOutbound.outbounds.length === 0) {
  throw new Error('self-auto 未匹配到非免费节点（已排除包含"免费"的节点）')
}

config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
