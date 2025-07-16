{`                <section className={styles.leftSection}>
                  <div className={styles.sncfLogoContainer}>
                    <Image src="/sncf-logo.png" alt="SNCF" fill sizes="80px" />
                  </div>
                  <div className={styles.statusText}>
                    {status.status === 'ontime' ? "à l'heure" : status.status === 'delayed' ? \`Retard \${schedule.delayMinutes}min\` : 'Supprimé'}
                  </div>
                  <time className={styles.departureTime} dateTime={displayTime}>
                    {formatTimeHHhmm(displayTime)}
                  </time>
                </section>`}
