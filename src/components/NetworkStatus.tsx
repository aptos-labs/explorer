import {useQuery} from "@tanstack/react-query";

interface ComponentStatus {
    id?: string
    name?: string
    status?: string
    description?: string
    indicator?: string
    group_id?: string
    group?: boolean
    components?: ComponentStatus[]
    maintenance?: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const useStatusPage = (componentName?: string) => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['statusPage'],
        queryFn: () => fetcher('https://status.movementnetwork.xyz/api/v2/summary.json')
    })

    const components: ComponentStatus[] = data
        ? data.components.map((comp: ComponentStatus) => ({
              id: comp.id,
              name: comp.name,
              status: comp.status,
              group_id: comp.group_id || null,
              group: comp.group || false,
              description: comp.description || '#',
              maintenance: comp.status === 'under_maintenance',
              components: comp.components || []
          }))
        : []

    const targetGroup = componentName 
        ? components.find(comp => comp.name === componentName && comp.group)
        : null

    const hasIssues = targetGroup
        ? components
            .filter(comp => comp.group_id === targetGroup.id)
            .some(comp => comp.status !== 'operational')
        : false

    const underMaintenance = targetGroup
        ? components
            .filter(comp => comp.group_id === targetGroup.id)
            .some(comp => comp.status === 'under_maintenance')
        : false

    const hasScheduledMaintenance = data?.scheduled_maintenances?.length > 0 && 
        data.scheduled_maintenances.some((maintenance: ComponentStatus) => {
            if (!targetGroup) return false;
            
            const affectsTargetGroup = maintenance.components?.some((comp: ComponentStatus) => {
                const componentInGroup = components.find(c => 
                    c.id === comp.id && c.group_id === targetGroup.id
                );
                return !!componentInGroup;
            });
            
            return affectsTargetGroup && 
                   (maintenance.status === 'scheduled' || 
                    maintenance.status === 'in_progress');
        });

    const maintenanceStatus = hasScheduledMaintenance
        ? data.scheduled_maintenances.find((m: ComponentStatus) => 
            m.components?.some(comp => components.some(c => c.id === comp.id && c.group_id === targetGroup?.id))
        )
        : null;

    const groupStatus = targetGroup
        ? {
              ...targetGroup,
              hasIssues,
              underMaintenance: underMaintenance || (maintenanceStatus?.status === 'in_progress'),
              scheduledMaintenance: false
          }
        : null

    const statusInfo = groupStatus
        ? {
              description: groupStatus.hasIssues 
                  ? 'Issues Reported' 
                  : groupStatus.scheduledMaintenance
                      ? 'Maintenance Scheduled'
                      : 'All systems operational',
              indicator: groupStatus.hasIssues 
                  ? 'major_outage' 
                  : groupStatus.scheduledMaintenance
                      ? 'scheduled'
                      : 'none',
              name: groupStatus.name,
              maintenance: groupStatus.underMaintenance,
              scheduledMaintenance: groupStatus.scheduledMaintenance
          }
        : null

    return {
        components,
        groupStatus,
        statusInfo,
        isLoading,
        error,
    }
}


interface StatusCardProps {
    componentName?: string
    maintenance?: boolean
}

const StatusCard: React.FC<StatusCardProps> = ({ componentName }) => {
    const { components, statusInfo } = useStatusPage(componentName)

    const getStatusColor = (indicator: string | undefined, maintenance?: boolean) => {
        if (maintenance) return '#ffd337'
        switch (indicator?.toLowerCase()) {
            case 'operational':
            case 'none':
                return '#22c55e'
            case 'degraded_performance':
            case 'minor':
                return '#eab308' 
            case 'partial_outage':
            case 'major':
                return '#f97316' 
            case 'critical':
            case 'major_outage':
                return '#ef4444' 
            case 'scheduled':
                return '#0ea5e9'  //blue
            default:
                return '#6b7280' 
        }
    }

    if (componentName && statusInfo) {
        if (!statusInfo.maintenance && !statusInfo.scheduledMaintenance && statusInfo.indicator === 'none') {
            return null;
        }
        
        const badgeStyle = {
            position: 'fixed' as const,
            bottom: '20px',
            left: '20px',
            zIndex: 999999
        }
        
        const badgeContentStyle = {
            backgroundColor: '#000',
            boxShadow: statusInfo.maintenance || statusInfo.indicator !== 'none' 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 300ms ease-in-out',
            maxWidth: '250px'
        }
        
        const indicatorStyle = {
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(statusInfo.indicator, statusInfo.maintenance),
            animation: statusInfo.maintenance || statusInfo.indicator !== 'none' 
                ? 'pulse 2s infinite' 
                : 'none',
        }
        
        const textStyle = {
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff'
        }
        
        const maintenanceTextStyle = {
            ...textStyle,
            color: '#ffd337'
        }
        
        const normalTextStyle = {
            ...textStyle,
            color: '#e5e7eb'
        }

        return (
            <div style={badgeStyle}>
                <a href="https://status.movementnetwork.xyz" target="_blank" style={{ textDecoration: 'none' }}>
                    <div style={badgeContentStyle}>
                        <span style={indicatorStyle}></span>
                        <div style={textStyle}>
                            {statusInfo.maintenance ? (
                                <div style={maintenanceTextStyle}>Currently Under Maintenance</div>
                            ) : statusInfo.scheduledMaintenance ? (
                                <div style={maintenanceTextStyle}>Maintenance Scheduled</div>
                            ) : (
                                <div style={normalTextStyle}>{statusInfo.description}</div>
                            )}
                        </div>
                    </div>
                </a>
            </div>
        )
    }

    return null;

    const containerStyle = {
        padding: '24px',
        backgroundColor: '#111827', // gray-900
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: '100%'
    }

    return (
        <div style={containerStyle}>
            {components.length > 0
                ? components
                      .filter((group) => group.group)
                      .map((group) => {
                          const groupStyle = {
                              width: '100%',
                              marginBottom: '40px'
                          }
                          
                          const headingStyle = {
                              fontSize: '24px',
                              fontWeight: 600,
                              marginBottom: '16px',
                              width: '100%'
                          }
                          
                          const gridStyle = {
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '16px',
                              margin: '16px 0'
                          }
                          
                          return (
                              <div key={group.id} style={groupStyle}>
                                  <h2 style={headingStyle}>{group.name}</h2>
                                  <div style={gridStyle}>
                                      {components
                                          .filter((comp) => comp.group_id === group.id)
                                          .map((comp) => {
                                              const cardStyle = {
                                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                  backdropFilter: 'blur(8px)',
                                                  padding: '16px',
                                                  borderRadius: '8px',
                                                  display: 'flex',
                                                  justifyContent: 'flex-start',
                                                  alignItems: 'center',
                                                  transition: 'background-color 200ms ease-in-out',
                                                  marginBottom: '16px',
                                                  textDecoration: 'none',
                                                  color: 'inherit'
                                              }
                                              
                                              const dotStyle = {
                                                  width: '16px',
                                                  height: '16px',
                                                  borderRadius: '50%',
                                                  backgroundColor: getStatusColor(comp.status, comp.maintenance)
                                              }
                                              
                                              const textContainerStyle = {
                                                  marginLeft: '16px'
                                              }
                                              
                                              const titleStyle = {
                                                  fontSize: '14px',
                                                  fontWeight: 500
                                              }
                                              
                                              const subtitleStyle = {
                                                  fontSize: '12px',
                                                  color: '#9ca3af'
                                              }
                                              
                                              return (
                                                  <a
                                                      href={comp.description}
                                                      key={comp.id}
                                                      style={cardStyle}
                                                  >
                                                      <span style={dotStyle}></span>
                                                      <div style={textContainerStyle}>
                                                          <div style={titleStyle}>{comp.name}</div>
                                                          <div style={subtitleStyle}>
                                                              {comp.maintenance 
                                                                  ? 'Under Maintenance' 
                                                                  : comp.status?.replace('_', ' ')}
                                                          </div>
                                                      </div>
                                                  </a>
                                              )
                                          })}
                                  </div>
                              </div>
                          )
                      })
                : null}
        </div>
    )
}

export default StatusCard
